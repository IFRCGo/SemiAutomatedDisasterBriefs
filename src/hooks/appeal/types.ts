import type { AppealType } from '../../api/types/appealType';

export type AppealTrendStats = {
    count: number;
    medianTargetedPeople: number;
    medianFundingRequested: number;
    medianCoverage: number;
    medianCostPerBeneficiary: number;
};

export type CountryHistoricalAppealStats = Record<AppealType, AppealTrendStats>;

export type CountryActiveAppealStats = {
    eaCount: number;
    drefCount: number;
    targetedPeopleCount: number;
    totalFunding: number;
    medianCostPerBeneficiary: number;
};

export type RegionActiveAppealStats = {
    eaCount: number;
    medianEaAmountRequested: number;
    fundingCoverage: number;
    drefCount: number;
    medianDrefAmountRequested: number;
};

export type RegionHistoricalAppealPoint = {
    name: string;
    countryId: number;
    targetedPopulation: number;
    amountRequested: number;
};

export type RegionHistoricalAppealsByType = Record<AppealType, RegionHistoricalAppealPoint[]>;
