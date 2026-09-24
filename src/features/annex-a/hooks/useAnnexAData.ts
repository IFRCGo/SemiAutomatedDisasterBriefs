import { useCountry } from '../../../hooks/country/useCountry';
import { useCountryDatabank } from '../../../hooks/country/useCountryDatabank';
import { useHistoricalKpiData } from '../../../hooks/country/useHistoricalKpiData';
import { usePartners } from '../../../hooks/country/usePartners';
import { useIncomeBreakdown } from '../../../hooks/country/useIncomeBreakdown';
import { usePeopleReachedCount } from '../../../hooks/country/usePeopleReachedCount';
import { combineQueryStates } from '../../../hooks/utils/combineQueryStates';

export function useAnnexAData(countryId: number, countryIso3: string) {
    const country = useCountry(countryId);
    const countryDatabank = useCountryDatabank(countryId);
    const hasCountryPlan = country.data?.has_country_plan === true;
    const countryPartners = usePartners(countryId, { enabled: hasCountryPlan });
    const countryIncome = useIncomeBreakdown(countryId);
    const peopleReachedCount = usePeopleReachedCount(countryId);
    const historicalKpiData = useHistoricalKpiData(countryIso3);

    const icrcPresence = {
        data: country.data?.icrc_presence?.icrc_presence ?? false,
        isPending: country.isPending,
        error: country.error,
    };

    const branchCount = {
        data: countryDatabank.data?.fdrs_branches ?? 0,
        isPending: countryDatabank.isPending,
        error: countryDatabank.error,
    };

    const partners = hasCountryPlan
        ? countryPartners
        : {
              data: [] as string[],
              isPending: false,
              error: null,
          };

    return combineQueryStates({
        icrcPresence,
        databank: countryDatabank,
        partners,
        incomeTally: countryIncome,
        branchCount,
        peopleReachedCount,
        historicalKpiData,
    });
}
