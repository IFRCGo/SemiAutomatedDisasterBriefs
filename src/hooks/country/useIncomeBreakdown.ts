import { useQuery } from '@tanstack/react-query';
import { getCountryIncome, type FDRSIncome } from '../../api/endpoints/countryIncome';

type IncomeSource = 'government' | 'ifrc' | 'icrc' | 'other';

type CountryIncomeResponse = FDRSIncome;
type CountryIncomeItem = CountryIncomeResponse[number];
type IndicatorId = CountryIncomeItem['indicator'];

const INDICATORS: Partial<Record<IndicatorId, Exclude<IncomeSource, 'other'>>> = {
    1: 'government',
    12: 'ifrc',
    13: 'icrc',
};

export type IncomeBreakdown = Record<IncomeSource, number>;

function toIncomeBreakdown(countryIncome: CountryIncomeResponse): IncomeBreakdown {
    const incomeBreakdown: IncomeBreakdown = {
        government: 0,
        ifrc: 0,
        icrc: 0,
        other: 0,
    };

    countryIncome.forEach((income) => {
        const source = INDICATORS[income.indicator] ?? 'other';
        incomeBreakdown[source] += income.value ?? 0;
    });

    return incomeBreakdown;
}

export function useIncomeBreakdown(countryId: number) {
    return useQuery({
        queryKey: ['countryIncome', countryId],
        queryFn: () => getCountryIncome(countryId),
        select: toIncomeBreakdown,
    });
}
