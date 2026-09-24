import type { components } from '../types/generated';

type ApiAppealTypeEnumKey = components['schemas']['ApiAppealTypeEnumKey'];

export const APPEAL_TYPES = ['dref', 'ea'] as const;
export type AppealType = (typeof APPEAL_TYPES)[number];

const APPEAL_TYPE_TO_KEY = {
    dref: 0,
    ea: 1,
} as const satisfies Record<AppealType, ApiAppealTypeEnumKey>;

export function getAppealTypeKey(appealType: AppealType): ApiAppealTypeEnumKey {
    return APPEAL_TYPE_TO_KEY[appealType];
}
