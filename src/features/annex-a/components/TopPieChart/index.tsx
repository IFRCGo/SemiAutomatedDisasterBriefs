import styles from './styles.module.css';
import { PieChart } from '@ifrc-go/ui';
import { abbreviateNumber } from '../../../annex-shared/utils/abbreviate';

type Props = {
    labels: string[];
    values: number[];
};

const colours = [
    'var(--go-ui-color-primary-red)',
    'var(--go-ui-color-red-70)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-10)',
];

export function AnnexPieChart(props: Props) {
    type Data = {
        label: string;
        value: number;
        index: number;
    };

    const items: Data[] = props.labels
        .map((label, index) => ({
            label: label + ` (${abbreviateNumber(props.values[index])})`,
            value: props.values[index],
            index,
        }))
        .sort((a, b) => {
            return b.value - a.value;
        });

    return (
        <PieChart
            className={styles.setFont}
            legendClassName={styles.legend}
            data={items}
            valueSelector={(item) => item.value}
            labelSelector={(item) => item.label}
            keySelector={(item) => item.label}
            colors={colours}
            colorSelector={undefined}
            showPercentageInLegend={true}
        />
    );
}
