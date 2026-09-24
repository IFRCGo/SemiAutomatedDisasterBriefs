import { fetchAllPages, getOrThrow } from '../client';
import type { paths, components } from '../types/generated';
import { APPEAL_TYPES, type AppealType, getAppealTypeKey } from '../types/appealType';
import { type DisasterType, getDisasterTypeKey } from '../types/disasterType';

const ENDPOINT = '/api/v2/appeal/' as const;

type AppealListResponse =
    paths[typeof ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type Appeal = NonNullable<AppealListResponse['results']>[number];

type AppealListQuery = NonNullable<paths[typeof ENDPOINT]['get']['parameters']['query']>;

type GetAppealsByTypeParams = {
    scope: { countryId: number } | { regionId: number };
    period: 'active' | 'historical';
    disasterType?: DisasterType;
};

type AppealQueryParams = GetAppealsByTypeParams & {
    appealType: AppealType;
};

type AppealsByType = Record<AppealType, Appeal[]>;

const APPEAL_ACTIVE_STATUS_KEY: components['schemas']['ApiAppealStatusEnumKey'] = 0;

const HISTORICAL_START_DATE = '2000-01-01';

async function getAppeals(query: AppealListQuery): Promise<Appeal[]> {
    const data = await getOrThrow(ENDPOINT, {
        params: {
            query,
        },
    });

    return fetchAllPages(data);
}

function buildAppealQuery({
    scope,
    period,
    appealType,
    disasterType,
}: AppealQueryParams): AppealListQuery {
    return {
        country: 'countryId' in scope ? [scope.countryId] : undefined,
        region: 'regionId' in scope ? [scope.regionId] : undefined,
        status: period === 'active' ? APPEAL_ACTIVE_STATUS_KEY : undefined,
        start_date__gte: period === 'historical' ? HISTORICAL_START_DATE : undefined,
        atype: getAppealTypeKey(appealType),
        dtype: disasterType !== undefined ? getDisasterTypeKey(disasterType) : undefined,
    };
}

export async function getAppealsByType({
    scope,
    period,
    disasterType,
}: GetAppealsByTypeParams): Promise<AppealsByType> {
    const appealsByTypeEntries = await Promise.all(
        APPEAL_TYPES.map(async (appealType) => {
            const appeals = await getAppeals(
                buildAppealQuery({
                    scope,
                    period,
                    appealType,
                    disasterType,
                })
            );

            return [appealType, appeals] as const;
        })
    );

    return Object.fromEntries(appealsByTypeEntries) as AppealsByType;
}

export function getActiveCountryAppeals(
    countryId: number,
    disasterType?: DisasterType
): Promise<AppealsByType> {
    return getAppealsByType({
        scope: { countryId },
        period: 'active',
        disasterType,
    });
}

export function getHistoricalCountryAppeals(
    countryId: number,
    disasterType?: DisasterType
): Promise<AppealsByType> {
    return getAppealsByType({
        scope: { countryId },
        period: 'historical',
        disasterType,
    });
}

export function getActiveRegionAppeals(
    regionId: number,
    disasterType?: DisasterType
): Promise<AppealsByType> {
    return getAppealsByType({
        scope: { regionId },
        period: 'active',
        disasterType,
    });
}

export function getHistoricalRegionAppeals(
    regionId: number,
    disasterType?: DisasterType
): Promise<AppealsByType> {
    return getAppealsByType({
        scope: { regionId },
        period: 'historical',
        disasterType,
    });
}
