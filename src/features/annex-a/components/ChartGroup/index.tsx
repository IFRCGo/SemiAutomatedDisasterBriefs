import styles from './styles.module.css';
import { VertBarChart } from '../VertBarChart';
import { AnnexTitle } from '../../../annex-shared/components/AnnexTitle';
import { ListView } from '@ifrc-go/ui';
import { AnnexSubtitle } from '../../../annex-shared/components/AnnexSubtitle';

type TrendData = Partial<Record<number, number>> | undefined;

export interface ChartGroupProps {
    branchCount: TrendData;
    staff: TrendData;
    id?: string;
}

function toSeries(byYear: Partial<Record<2023 | 2024, number>> | undefined) {
    if (!byYear) {
        return [];
    }

    return (Object.entries(byYear) as [string, number][])
        .map(([year, value]) => ({ year, value }))
        .sort((a, b) => Number(a.year) - Number(b.year));
}

export function ChartGroup(props: ChartGroupProps) {
    const branchCount = toSeries(props.branchCount);
    const staff = toSeries(props.staff);

    return (
        <div className={styles.container} id={props.id}>
            <div className={styles.leftContainer}>
                {branchCount.length ? (
                    <VertBarChart
                        labels={branchCount.map((x) => x.year)}
                        values={branchCount.map((x) => x.value)}
                        title="Branches"
                    />
                ) : (
                    <ListView layout="block" withCenteredContents={true}>
                        <AnnexSubtitle value="Branches" />
                        <AnnexTitle value="-" />
                    </ListView>
                )}
            </div>

            <div className={styles.rightContainer}>
                {staff.length ? (
                    <VertBarChart
                        labels={staff.map((x) => x.year)}
                        values={staff.map((x) => x.value)}
                        title="Staff"
                    />
                ) : (
                    <ListView layout="block" withCenteredContents={true}>
                        <AnnexSubtitle value="Staff" />
                        <AnnexTitle value="-" />
                    </ListView>
                )}
            </div>
        </div>
    );
}
