import type { components } from '../types/generated';

export type ApiRegionNameEnumKey = components['schemas']['ApiRegionNameEnumKey'];

const REGION_NAMES: Record<ApiRegionNameEnumKey, string> = {
    0: 'Africa',
    1: 'Americas',
    2: 'Asia Pacific',
    3: 'Europe',
    4: 'Middle East & North Africa',
};

export function getRegionName(regionId: ApiRegionNameEnumKey): string {
    return REGION_NAMES[regionId];
}
