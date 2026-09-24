import styles from './styles.module.css';
import { abbreviateNumber } from '../../../annex-shared/utils/abbreviate';
import type { AppealTrendStats, CountryHistoricalAppealStats } from '../../../../hooks/appeal';

const formatValue = (val: number | string | null | undefined) => {
    if (val == null) return '-';
    if (typeof val === 'string') return val;
    return abbreviateNumber(val);
};

interface TrendRowProps {
    label: string;
    stats: AppealTrendStats;
}

function TrendRow({ label, stats }: TrendRowProps): JSX.Element {
    return (
        <tr>
            <td>{label}</td>
            <td>{formatValue(stats.count)}</td>
            <td>{formatValue(stats.medianTargetedPeople)}</td>
            <td>{formatValue(stats.medianFundingRequested)}</td>
            <td>{formatValue(stats.medianCoverage)}%</td>
            <td>{formatValue(stats.medianCostPerBeneficiary)}</td>
        </tr>
    );
}

export function TrendsTable(props: CountryHistoricalAppealStats): JSX.Element {
    return (
        <div className={styles.chartSection}>
            <table className={styles.trendsTable}>
                <thead>
                    <tr>
                        <th></th>
                        <th># of appeals</th>
                        <th>Median # of targeted people</th>
                        <th>Median funding requested (CHF)</th>
                        <th>Median appeal coverage</th>
                        <th>Median cost per beneficiary (CHF)</th>
                    </tr>
                </thead>
                <tbody>
                    <TrendRow label="EA" stats={props.ea} />
                    <TrendRow label="DREF" stats={props.dref} />
                </tbody>
            </table>
        </div>
    );
}
