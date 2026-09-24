import { DisasterType } from '../../../api/types/disasterType';
import type {
    CountryActiveAppealStats,
    CountryHistoricalAppealStats,
    RegionActiveAppealStats,
    RegionHistoricalAppealsByType,
} from '../../../hooks/appeal';
import {
    useActiveCountryAppealStats,
    useActiveRegionAppealStats,
    useHistoricalCountryAppealStats,
    useHistoricalRegionAppeals,
} from '../../../hooks/appeal';
import {
    combineQueryStates,
    type CombinedQueryState,
} from '../../../hooks/utils/combineQueryStates';

type AnnexBData = {
    activeCountryStats: CountryActiveAppealStats;
    historicalCountryStats: CountryHistoricalAppealStats;
    activeRegionStats: RegionActiveAppealStats;
    historicalRegionAppeals: RegionHistoricalAppealsByType;
};

export function useAnnexBData(
    countryId: number,
    regionId: number,
    disasterType?: DisasterType
): CombinedQueryState<AnnexBData> {
    const activeCountryStats = useActiveCountryAppealStats(countryId, disasterType);
    const historicalCountryStats = useHistoricalCountryAppealStats(countryId, disasterType);
    const activeRegionStats = useActiveRegionAppealStats(regionId, disasterType);
    const historicalRegionAppeals = useHistoricalRegionAppeals(regionId, disasterType);

    return combineQueryStates({
        activeCountryStats,
        historicalCountryStats,
        activeRegionStats,
        historicalRegionAppeals,
    });
}
