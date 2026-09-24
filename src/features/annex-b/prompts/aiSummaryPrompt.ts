import type {
    CountryActiveAppealStats,
    CountryHistoricalAppealStats,
    RegionActiveAppealStats,
} from '../../../hooks/appeal';

type BuildAiSummaryPromptArgs = {
    countryName: string;
    disasterName?: string;
    activeCountryAppealStats: CountryActiveAppealStats;
    historicalCountryAppealStats: CountryHistoricalAppealStats;
    activeRegionAppealStats: RegionActiveAppealStats;
};

function getDisasterPhrase(disasterName?: string): string {
    if (!disasterName) {
        return '';
    }

    return `${disasterName} `;
}

function getDisasterScopePhrase(disasterName?: string): string {
    if (!disasterName) {
        return 'all-disaster ';
    }

    return `${disasterName.toLowerCase()} `;
}

export function buildAiSummaryPrompt({
    countryName,
    disasterName,
    activeCountryAppealStats,
    historicalCountryAppealStats,
    activeRegionAppealStats,
}: BuildAiSummaryPromptArgs): string | null {
    const sentences: string[] = [];
    const disasterPhrase = getDisasterPhrase(disasterName);
    const disasterScopePhrase = getDisasterScopePhrase(disasterName);

    if (
        activeCountryAppealStats.eaCount !== undefined &&
        activeCountryAppealStats.drefCount !== undefined
    ) {
        sentences.push(
            `Currently, ${countryName} has ${activeCountryAppealStats.eaCount} active ${disasterPhrase}Emergency Appeals (EAs) and ${activeCountryAppealStats.drefCount} active ${disasterPhrase}DREFs.`
        );
    }

    if (
        historicalCountryAppealStats.ea.count !== undefined ||
        historicalCountryAppealStats.dref.count !== undefined
    ) {
        sentences.push(
            `Historically since 2000, the National Society has responded to ${historicalCountryAppealStats.ea.count} ${disasterPhrase}EAs and ${historicalCountryAppealStats.dref.count} ${disasterPhrase}DREFs.`
        );
    }

    if (
        activeRegionAppealStats.eaCount !== undefined &&
        activeRegionAppealStats.drefCount !== undefined
    ) {
        sentences.push(
            `In the broader region, there are currently ${activeRegionAppealStats.eaCount} active ${disasterPhrase}EAs and ${activeRegionAppealStats.drefCount} active ${disasterPhrase}DREFs.`
        );
    }

    sentences.push(
        `Please provide a concise, professional 2-sentence summary of this ${disasterScopePhrase}appeals data.`
    );

    return sentences.length > 1 ? sentences.join(' ') : null;
}
