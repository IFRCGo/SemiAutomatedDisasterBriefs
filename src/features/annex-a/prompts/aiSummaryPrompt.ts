import type { IncomeBreakdown } from '../../../hooks/country/useIncomeBreakdown';

type AnnexACountry = {
    name: string;
    societyName?: string;
};

type CountryDatabankSnapshot = {
    fdrs_branches?: number | null;
    fdrs_volunteer_total?: number | null;
    fdrs_staff_total?: number | null;
};

type BuildAiSummaryPromptArgs = {
    country: AnnexACountry;
    databank?: CountryDatabankSnapshot | null;
    incomeTally?: IncomeBreakdown | null;
    partners?: string[] | null;
    branchCount?: number | null;
};

export function buildAiSummaryPrompt({
    country,
    databank,
    incomeTally,
    partners,
    branchCount,
}: BuildAiSummaryPromptArgs): string | null {
    const societyName = country.societyName ?? 'The National Society';
    const sentences: string[] = [];

    const infrastructureParts: string[] = [];
    if (branchCount) {
        infrastructureParts.push(`${branchCount} branches`);
    }

    const workforce = databank?.fdrs_volunteer_total
        ? `with ${databank.fdrs_volunteer_total.toLocaleString()} volunteers`
        : '';

    if (infrastructureParts.length > 0 || workforce) {
        sentences.push(
            `${societyName} operates through ${infrastructureParts.join(' and ')}${workforce ? `, ${workforce}` : ''}.`
        );
    }

    const partnerCount = partners?.length ?? 0;
    const partnerSnippet =
        partnerCount > 0 ? `working with partners like ${partners?.slice(0, 2).join(' and ')}` : '';

    const incomeParts: string[] = [];
    if (incomeTally?.government)
        incomeParts.push(`${incomeTally.government.toLocaleString()} from government`);
    if (incomeTally?.ifrc) incomeParts.push(`${incomeTally.ifrc.toLocaleString()} from IFRC`);
    if (incomeTally?.icrc) incomeParts.push(`${incomeTally.icrc.toLocaleString()} from ICRC`);
    if (incomeTally?.other)
        incomeParts.push(`${incomeTally.other.toLocaleString()} from other sources`);

    const incomeSnippet =
        incomeParts.length > 0 ? `is supported by funding of ${incomeParts.join(', ')}` : '';

    if (partnerSnippet || incomeSnippet) {
        sentences.push(
            `The society ${partnerSnippet}${partnerSnippet && incomeSnippet ? ' and ' : ''}${incomeSnippet}.`
        );
    }

    return sentences.length > 0 ? sentences.join(' ') : null;
}
