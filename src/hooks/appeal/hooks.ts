import { useQuery } from '@tanstack/react-query';
import {
    getActiveCountryAppeals,
    getActiveRegionAppeals,
    getHistoricalCountryAppeals,
    getHistoricalRegionAppeals,
} from '../../api/endpoints/appeal';
import { DisasterType } from '../../api/types/disasterType';
import {
    toActiveCountryAppealStats,
    toActiveRegionAppealStats,
    toHistoricalCountryAppealStats,
    toHistoricalRegionAppeals,
} from './transforms';

const ACTIVE_COUNTRY_APPEALS_QUERY_KEY = 'active-country-appeals';
const HISTORICAL_COUNTRY_APPEALS_QUERY_KEY = 'historical-country-appeals';
const ACTIVE_REGION_APPEALS_QUERY_KEY = 'active-region-appeals';
const HISTORICAL_REGION_APPEALS_QUERY_KEY = 'historical-region-appeals';

export function useActiveCountryAppealStats(countryId: number, disasterType?: DisasterType) {
    return useQuery({
        queryKey: [ACTIVE_COUNTRY_APPEALS_QUERY_KEY, countryId, disasterType],
        queryFn: () => getActiveCountryAppeals(countryId, disasterType),
        select: toActiveCountryAppealStats,
    });
}

export function useHistoricalCountryAppealStats(countryId: number, disasterType?: DisasterType) {
    return useQuery({
        queryKey: [HISTORICAL_COUNTRY_APPEALS_QUERY_KEY, countryId, disasterType],
        queryFn: () => getHistoricalCountryAppeals(countryId, disasterType),
        select: toHistoricalCountryAppealStats,
    });
}

export function useActiveRegionAppealStats(regionId: number, disasterType?: DisasterType) {
    return useQuery({
        queryKey: [ACTIVE_REGION_APPEALS_QUERY_KEY, regionId, disasterType],
        queryFn: () => getActiveRegionAppeals(regionId, disasterType),
        select: toActiveRegionAppealStats,
    });
}

export function useHistoricalRegionAppeals(regionId: number, disasterType?: DisasterType) {
    return useQuery({
        queryKey: [HISTORICAL_REGION_APPEALS_QUERY_KEY, regionId, disasterType],
        queryFn: () => getHistoricalRegionAppeals(regionId, disasterType),
        select: toHistoricalRegionAppeals,
    });
}
