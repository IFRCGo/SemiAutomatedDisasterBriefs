// Add more from https://goadmin.ifrc.org/api/v2/disaster_type/
export const DISASTER_TYPES = ['Cyclone', 'Drought', 'Earthquake', 'Flood'] as const;

export type DisasterType = (typeof DISASTER_TYPES)[number];

const DISASTER_TYPE_KEYS: Record<DisasterType, number> = {
    Cyclone: 2,
    Drought: 4,
    Earthquake: 1,
    Flood: 12,
};

export function getDisasterTypeKey(disaster: DisasterType): number {
    return DISASTER_TYPE_KEYS[disaster];
}
