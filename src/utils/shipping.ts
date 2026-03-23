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

        // Fetch locations + methods for all zones in parallel (including zone 0 = Rest of World fallback)
        const enrichedZones = await Promise.all(
            zones.map(async (zone: WooCommerceShippingZone) => {
                    const [locations, methods] = await Promise.all([
                        getShippingZoneLocations(zone.id),
                        getShippingZoneMethods(zone.id),
                    ]);
                    return {
                        ...zone,
                        locations,
                        methods: methods.filter((m: WooCommerceShippingMethod) => m.enabled),
                    } as EnrichedShippingZone;
                })
        );

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

/**
 * Matches a pre-fetched list of shipping zones against a given Portuguese postal code.
 * @param postalCode Portuguese postal code (e.g., "4000-123")
 * @param zones Enriched zones from WooCommerce
 * @returns The matched shipping method or null
 */
export function matchShippingZoneWithMethod(postalCode: string, zones: EnrichedShippingZone[]): WooCommerceShippingMethod | null {
    if (!postalCode) return null;

    // WooCommerce stores wildcards like "40*"
    // And exact matches like "4000-123"
    // Just grab the first part for wildcard checks if it's formatted
    const cleanPostalCode = postalCode.trim();
    const postalCodeParts = cleanPostalCode.split('-');
    const zipCodeFirstPart = postalCodeParts[0] || '';

    // Sort zones by order (WooCommerce matches top to bottom); zone 0 (Rest of World) sorts last
    const sortedZones = [...zones].sort((a, b) => {
        if (a.id === 0) return 1;
        if (b.id === 0) return -1;
        return a.order - b.order;
    });

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
                    if (rule.endsWith('*')) {
                        // Wildcard match (e.g. 40*)
                        const prefix = rule.replace('*', '');
                        if (cleanPostalCode.startsWith(prefix) || zipCodeFirstPart.startsWith(prefix)) {
                            return zone.methods[0] || null;
                        }
                    } else if (rule.includes('...')) {
                        // Range match (e.g. 4000...4999)
                        const [start, end] = rule.split('...');
                        const zipNum = parseInt(zipCodeFirstPart, 10);
                        if (!isNaN(zipNum) && zipNum >= parseInt(start, 10) && zipNum <= parseInt(end, 10)) {
                            return zone.methods[0] || null;
                        }
                    } else {
                        // Exact match
                        if (cleanPostalCode === rule || zipCodeFirstPart === rule) {
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
