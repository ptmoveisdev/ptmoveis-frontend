import type { WooCommerceShippingZone, WooCommerceShippingMethod, WooCommerceShippingLocation } from '../types/wordpress';
import { getShippingZones, getShippingZoneLocations, getShippingZoneMethods } from '../services/wordpress';

export interface EnrichedShippingZone extends WooCommerceShippingZone {
    locations: WooCommerceShippingLocation[];
    methods: WooCommerceShippingMethod[];
}

/**
 * Fetches all active shipping zones from WooCommerce and enriches them with locations and methods.
 */
export async function fetchAllShippingZones(): Promise<EnrichedShippingZone[]> {
    try {
        const zones = await getShippingZones();
        const enrichedZones: EnrichedShippingZone[] = [];

        for (const zone of zones) {
            // Ignore "Rest of the World" (ID 0) for now, unless we want a fallback
            if (zone.id === 0) continue;

            const locations = await getShippingZoneLocations(zone.id);
            const methods = await getShippingZoneMethods(zone.id);

            enrichedZones.push({
                ...zone,
                locations,
                methods: methods.filter((m: WooCommerceShippingMethod) => m.enabled)
            });
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

    // Sort zones by order (WooCommerce matches top to bottom)
    const sortedZones = [...zones].sort((a, b) => a.order - b.order);

    for (const zone of sortedZones) {
        for (const loc of zone.locations) {
            if (loc.type === 'postcode') {
                const rules = loc.code.split('\n').map(r => r.trim()).filter(Boolean);

                for (const rule of rules) {
                    if (rule.endsWith('*')) {
                        // Wildcard match (e.g. 40*)
                        const prefix = rule.replace('*', '');
                        // A wildcard '40*' means it matches any postal code starting with '40'
                        // Often WooCommerce uses only the first 4 digits, but we will match the raw string as per standard behavior
                        if (cleanPostalCode.startsWith(prefix) || zipCodeFirstPart.startsWith(prefix)) {
                            return zone.methods[0] || null; // Usually we take the first enabled method for the zone
                        }
                    } else if (rule.includes('...')) {
                        // Range match (e.g. 4000...4999) - less common in PT but possible
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
                // Fallback to Country if it explicitly targets Portugal as a whole
                return zone.methods[0] || null;
            } else if (loc.type === 'state' && loc.code.startsWith('PT:')) {
                // Ignore district matches for now unless requested
            }
        }
    }

    return null;
}
