import raw from '../static/fdrs_historical_staff_local_units.json';

export type HistoricalYear = 2023 | 2024;

export type KpiCode = 'KPI_PStaff_Tot' | 'KPI_noLocalUnits';

type HistoricalKpiDataRecord = {
    Year: HistoricalYear;
    KPI: { KpiCode: KpiCode };
    Value: `${number}`;
    CountryInfo: { ISO3: string };
};

export type HistoricalKpiDataResponse = HistoricalKpiDataRecord[];

const historicalCountryData = raw as HistoricalKpiDataResponse;

export async function getHistoricalKpiData(
    countryIso3: string
): Promise<HistoricalKpiDataResponse> {
    return historicalCountryData.filter((record) => record.CountryInfo.ISO3 === countryIso3);
}
