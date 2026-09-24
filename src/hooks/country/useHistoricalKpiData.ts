import { useQuery } from '@tanstack/react-query';
import {
    getHistoricalKpiData,
    HistoricalYear,
    KpiCode,
    type HistoricalKpiDataResponse,
} from '../../api/endpoints/historicalKpiData';

export type HistoricalKpiData = {
    staff: Partial<Record<HistoricalYear, number>>;
    branchCount: Partial<Record<HistoricalYear, number>>;
};

const CODE_TO_KPI: Record<KpiCode, keyof HistoricalKpiData> = {
    KPI_PStaff_Tot: 'staff',
    KPI_noLocalUnits: 'branchCount',
};

function toHistoricalKpiData(records: HistoricalKpiDataResponse): HistoricalKpiData {
    const result: HistoricalKpiData = { staff: {}, branchCount: {} };

    records.forEach((record) => {
        const kpi = CODE_TO_KPI[record.KPI.KpiCode];
        result[kpi][record.Year] = Number(record.Value);
    });

    return result;
}

export function useHistoricalKpiData(countryIso3: string) {
    return useQuery({
        queryKey: ['historicalKpiData', countryIso3],
        queryFn: () => getHistoricalKpiData(countryIso3),
        select: toHistoricalKpiData,
    });
}
