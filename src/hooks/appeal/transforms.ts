import type { Appeal } from '../../api/endpoints/appeal';
import type { AppealType } from '../../api/types/appealType';
import type {
    AppealTrendStats,
    CountryActiveAppealStats,
    CountryHistoricalAppealStats,
    RegionActiveAppealStats,
    RegionHistoricalAppealPoint,
    RegionHistoricalAppealsByType,
} from './types';

function calculateMedian(values: readonly number[]): number | undefined {
    if (values.length === 0) {
        return undefined;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const mid = sorted.length >> 1;

    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

type ActiveCountryStatsAppeal = Pick<
    Appeal,
    'num_beneficiaries' | 'amount_requested' | 'amount_funded'
>;

type ActiveCountryStatsAppealsByType = Record<AppealType, ActiveCountryStatsAppeal[]>;

type HistoricalCountryStatsAppeal = Pick<
    Appeal,
    'num_beneficiaries' | 'amount_requested' | 'amount_funded'
>;

type HistoricalCountryStatsAppealsByType = Record<AppealType, HistoricalCountryStatsAppeal[]>;

type AppealTypeStats = {
    count: number;
    medianAmountRequested: number;
    totalRequested: number;
    totalFunded: number;
};

type ActiveRegionStatsAppeal = Pick<Appeal, 'amount_requested' | 'amount_funded'>;

type ActiveRegionStatsAppealsByType = Record<AppealType, ActiveRegionStatsAppeal[]>;

type HistoricalRegionSourceAppeal = Pick<
    Appeal,
    'name' | 'country' | 'num_beneficiaries' | 'amount_requested'
>;

type HistoricalRegionSourceAppealsByType = Record<AppealType, HistoricalRegionSourceAppeal[]>;

export function toActiveCountryAppealStats(
    appeals: ActiveCountryStatsAppealsByType
): CountryActiveAppealStats {
    const { ea, dref } = appeals;
    const allAppeals = [...ea, ...dref];

    let targetedPeopleCount = 0;
    let totalFunding = 0;
    const costsPerBeneficiary: number[] = [];

    allAppeals.forEach((appeal) => {
        targetedPeopleCount += appeal.num_beneficiaries ?? 0;
        totalFunding += appeal.amount_funded ?? 0;

        if (
            appeal.amount_requested != null &&
            appeal.num_beneficiaries != null &&
            appeal.num_beneficiaries > 0
        ) {
            costsPerBeneficiary.push(appeal.amount_requested / appeal.num_beneficiaries);
        }
    });

    return {
        eaCount: ea.length,
        drefCount: dref.length,
        targetedPeopleCount,
        totalFunding,
        medianCostPerBeneficiary: calculateMedian(costsPerBeneficiary) ?? 0,
    };
}

function toHistoricalCountryAppealTypeStats(
    appeals: HistoricalCountryStatsAppeal[]
): AppealTrendStats {
    const targetedPeople: number[] = [];
    const fundingRequested: number[] = [];
    const coverage: number[] = [];
    const costPerBeneficiary: number[] = [];

    appeals.forEach((appeal) => {
        if (appeal.num_beneficiaries != null) {
            targetedPeople.push(appeal.num_beneficiaries);
        }

        if (appeal.amount_requested != null) {
            fundingRequested.push(appeal.amount_requested);
        }

        if (
            appeal.amount_funded != null &&
            appeal.amount_requested != null &&
            appeal.amount_requested > 0
        ) {
            coverage.push((appeal.amount_funded / appeal.amount_requested) * 100);
        }

        if (
            appeal.amount_requested != null &&
            appeal.num_beneficiaries != null &&
            appeal.num_beneficiaries > 0
        ) {
            costPerBeneficiary.push(appeal.amount_requested / appeal.num_beneficiaries);
        }
    });

    return {
        count: appeals.length,
        medianTargetedPeople: calculateMedian(targetedPeople) ?? 0,
        medianFundingRequested: calculateMedian(fundingRequested) ?? 0,
        medianCoverage: calculateMedian(coverage) ?? 0,
        medianCostPerBeneficiary: calculateMedian(costPerBeneficiary) ?? 0,
    };
}

export function toHistoricalCountryAppealStats(
    appeals: HistoricalCountryStatsAppealsByType
): CountryHistoricalAppealStats {
    return {
        ea: toHistoricalCountryAppealTypeStats(appeals.ea),
        dref: toHistoricalCountryAppealTypeStats(appeals.dref),
    };
}

function toAppealTypeStats(appeals: ActiveRegionStatsAppeal[]): AppealTypeStats {
    const amountsRequested: number[] = [];
    let totalRequested = 0;
    let totalFunded = 0;

    appeals.forEach((appeal) => {
        if (appeal.amount_requested != null) {
            amountsRequested.push(appeal.amount_requested);
            totalRequested += appeal.amount_requested;
        }
        if (appeal.amount_funded != null) {
            totalFunded += appeal.amount_funded;
        }
    });

    return {
        count: appeals.length,
        medianAmountRequested: calculateMedian(amountsRequested) ?? 0,
        totalRequested,
        totalFunded,
    };
}

export function toActiveRegionAppealStats(
    appeals: ActiveRegionStatsAppealsByType
): RegionActiveAppealStats {
    const eaStats = toAppealTypeStats(appeals.ea);
    const drefStats = toAppealTypeStats(appeals.dref);

    const totalRequested = eaStats.totalRequested + drefStats.totalRequested;
    const totalFunded = eaStats.totalFunded + drefStats.totalFunded;
    const fundingCoverage = totalRequested > 0 ? (totalFunded / totalRequested) * 100 : 0;

    return {
        eaCount: eaStats.count,
        medianEaAmountRequested: eaStats.medianAmountRequested,
        fundingCoverage,
        medianDrefAmountRequested: drefStats.medianAmountRequested,
        drefCount: drefStats.count,
    };
}

function toHistoricalRegionAppeal({
    name,
    country,
    num_beneficiaries,
    amount_requested,
}: HistoricalRegionSourceAppeal): RegionHistoricalAppealPoint {
    return {
        name,
        countryId: country.id,
        targetedPopulation: num_beneficiaries ?? 0,
        amountRequested: amount_requested ?? 0,
    };
}

export function toHistoricalRegionAppeals({
    dref,
    ea,
}: HistoricalRegionSourceAppealsByType): RegionHistoricalAppealsByType {
    return {
        dref: dref.map(toHistoricalRegionAppeal),
        ea: ea.map(toHistoricalRegionAppeal),
    };
}
