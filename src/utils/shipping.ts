import type { WooCommerceShippingZone, WooCommerceShippingMethod, WooCommerceShippingLocation } from '../types/wordpress';
import { getShippingZones, getShippingZoneLocations, getShippingZoneMethods } from '../services/wordpress';

export interface EnrichedShippingZone extends WooCommerceShippingZone {
    locations: WooCommerceShippingLocation[];
    methods: WooCommerceShippingMethod[];
}

const SHIPPING_ZONES_CACHE_KEY = 'ptmoveis_shipping_zones_v2';
const SHIPPING_ZONES_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Fetches all active shipping zones from WooCommerce and enriches them with locations and methods.
 * Results are cached in sessionStorage for 15 minutes to avoid repeated API calls.
 * All per-zone requests are parallelized for speed.
 */
export async function fetchAllShippingZones(): Promise<EnrichedShippingZone[]> {
    // Return cached data if still fresh
    try {
        const cached = sessionStorage.getItem(SHIPPING_ZONES_CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached) as { data: EnrichedShippingZone[]; timestamp: number };
            if (Date.now() - timestamp < SHIPPING_ZONES_CACHE_TTL_MS) {
                return data;
            }
        }
    } catch {
        // Ignore parse errors; refetch below
    }

    try {
        const zones = await getShippingZones();

        // Fetch locations + methods for zones in small batches to avoid hitting host rate limits & preflight flood
        const BATCH_SIZE = 3;
        const enrichedZones: EnrichedShippingZone[] = [];

        for (let i = 0; i < zones.length; i += BATCH_SIZE) {
            const batch = zones.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(
                batch.map(async (zone: WooCommerceShippingZone) => {
                    const [locations, methods] = await Promise.all([
                        getShippingZoneLocations(zone.id).catch(err => {
                            console.warn(`Failed to fetch locations for zone ${zone.id}:`, err);
                            return [];
                        }),
                        getShippingZoneMethods(zone.id).catch(err => {
                            console.warn(`Failed to fetch methods for zone ${zone.id}:`, err);
                            return [];
                        }),
                    ]);
                    return {
                        ...zone,
                        locations: Array.isArray(locations) ? locations : [],
                        methods: Array.isArray(methods) ? methods.filter((m: WooCommerceShippingMethod) => m && m.enabled) : [],
                    } as EnrichedShippingZone;
                })
            );
            enrichedZones.push(...batchResults);
        }

        // Cache result
        try {
            sessionStorage.setItem(
                SHIPPING_ZONES_CACHE_KEY,
                JSON.stringify({ data: enrichedZones, timestamp: Date.now() })
            );
        } catch {
            // sessionStorage quota exceeded — continue without caching
        }

        return enrichedZones;
    } catch (error) {
        console.error("Failed to fetch shipping zones from WooCommerce:", error);
        return [];
    }
}

const normalizePostcode = (pc: string) => pc.replace(/[\s-]/g, '').toUpperCase();

/**
 * Matches a pre-fetched list of shipping zones against a given Portuguese postal code.
 * @param postalCode Portuguese postal code (e.g., "4000-123")
 * @param zones Enriched zones from WooCommerce
 * @returns The matched shipping method or null
 */
export function matchShippingZoneWithMethod(postalCode: string, zones: EnrichedShippingZone[]): WooCommerceShippingMethod | null {
    if (!postalCode) return null;

    const cleanPostalCode = normalizePostcode(postalCode);
    const zipCodeFirstPart = cleanPostalCode.slice(0, 4);

    // Sort active zones by order (lower order first), keeping original order for ties, and place Zone 0 at the end
    const activeZones = zones
        .filter(z => z.id !== 0)
        .map((zone, index) => ({ zone, index }))
        .sort((a, b) => {
            if (a.zone.order !== b.zone.order) {
                return a.zone.order - b.zone.order;
            }
            return a.index - b.index;
        })
        .map(item => item.zone);
    const zone0 = zones.find(z => z.id === 0);
    const sortedZones = zone0 ? [...activeZones, zone0] : activeZones;

    let restOfWorldMethod: WooCommerceShippingMethod | null = null;

    for (const zone of sortedZones) {
        // Zone 0 (Rest of World) has no locations — it's the implicit catch-all.
        // Save it as last-resort fallback and continue.
        if (zone.id === 0) {
            restOfWorldMethod = zone.methods[0] || null;
            continue;
        }

        for (const loc of zone.locations) {
            if (loc.type === 'postcode') {
                const rules = loc.code.split('\n').map(r => r.trim()).filter(Boolean);

                for (const rule of rules) {
                    const cleanRule = normalizePostcode(rule);
                    if (rule.endsWith('*')) {
                        // Wildcard match (e.g. 40*)
                        const prefix = normalizePostcode(rule.replace('*', ''));
                        if (cleanPostalCode.startsWith(prefix) || zipCodeFirstPart.startsWith(prefix)) {
                            return zone.methods[0] || null;
                        }
                    } else if (rule.includes('...')) {
                        // Range match (e.g. 4000...4999)
                        const [start, end] = rule.split('...');
                        const startNum = parseInt(normalizePostcode(start), 10);
                        const endNum = parseInt(normalizePostcode(end), 10);
                        const zipNum = parseInt(zipCodeFirstPart, 10);
                        if (!isNaN(zipNum) && !isNaN(startNum) && !isNaN(endNum) && zipNum >= startNum && zipNum <= endNum) {
                            return zone.methods[0] || null;
                        }
                    } else {
                        // Exact match
                        if (cleanPostalCode === cleanRule || zipCodeFirstPart === cleanRule) {
                            return zone.methods[0] || null;
                        }
                    }
                }
            } else if (loc.type === 'country' && loc.code === 'PT') {
                return zone.methods[0] || null;
            } else if (loc.type === 'state' && loc.code.startsWith('PT:')) {
                // Ignore district matches for now unless requested
            }
        }
    }

    // Nothing matched — fall back to zone 0 (Rest of World) if available
    return restOfWorldMethod;
}
