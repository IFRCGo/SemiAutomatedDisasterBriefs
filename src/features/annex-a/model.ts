export interface IndicatorGroupProps {
    label: string;
    volunteers?: number | null;
    branchCount?: number | null;
    staff?: number | null;
    peopleReachedCount?: number | null;
    income?: number | null;
    expenditure?: number | null;
}

export interface PartnerSocietiesProps {
    partners: string[];
}

export function getIndicators(props: IndicatorGroupProps) {
    return [
        { label: 'Volunteers', value: props.volunteers },
        { label: 'Branches', value: props.branchCount },
        { label: 'Staff', value: props.staff },
        { label: 'People Reached', value: props.peopleReachedCount },
        { label: 'Income', value: props.income },
        { label: 'Expenditure', value: props.expenditure },
    ];
}
