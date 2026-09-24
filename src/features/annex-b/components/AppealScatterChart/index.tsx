import {
    ScatterChart as RechartsScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import React, { useMemo } from 'react';
import { AnnexSubtitle } from '../../../annex-shared/components/AnnexSubtitle';
import styles from './styles.module.css';
import { abbreviateNumber } from '../../../annex-shared/utils/abbreviate';
import type { RegionHistoricalAppealPoint } from '../../../../hooks/appeal';

const AXIS_LABEL_COLOUR = 'var(--go-ui-color-gray-70)';

function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = [];
    const fail: T[] = [];

    for (const item of array) {
        if (predicate(item)) {
            pass.push(item);
        } else {
            fail.push(item);
        }
    }

    return [pass, fail];
}

interface AppealScatterChartProps {
    title: string;
    appeals: RegionHistoricalAppealPoint[];
    highlightCountryId: number;
    hideOutliers: boolean;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: RegionHistoricalAppealPoint;
    }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '10px 14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontFamily: 'Open Sans, sans-serif',
                }}
            >
                <p
                    style={{
                        margin: '0 0 6px 0',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: 'var(--go-ui-color-primary-red, #F5333F)',
                        fontFamily: 'Montserrat, sans-serif',
                    }}
                >
                    {`${data.name}`}
                </p>
                <p style={{ margin: '2px 0', color: '#333' }}>
                    <strong>Targeted:</strong> {data.targetedPopulation?.toLocaleString()}
                </p>
                <p style={{ margin: '2px 0', color: '#333' }}>
                    <strong>Requested:</strong> {data.amountRequested?.toLocaleString()} CHF
                </p>
                <p style={{ margin: '2px 0', color: '#333' }}>
                    <strong>Cost per beneficiary:</strong>{' '}
                    {((data.amountRequested ?? 0) / (data.targetedPopulation ?? 1)).toFixed(2)} CHF
                </p>
            </div>
        );
    }
    return null;
};

// https://en.wikipedia.org/wiki/Mahalanobis_distance
function removeOutliers(data: RegionHistoricalAppealPoint[]): RegionHistoricalAppealPoint[] {
    // NOTE: data should be filtered from the hook, safe to assume fields exist
    if (data.length < 2) return data;

    const x = data.map((d) => d.amountRequested ?? 0);
    const y = data.map((d) => d.targetedPopulation ?? 0);
    const n = data.length;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let covXX = 0;
    let covYY = 0;
    let covXY = 0;

    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        covXX += dx * dx;
        covYY += dy * dy;
        covXY += dx * dy;
    }

    covXX /= n - 1;
    covYY /= n - 1;
    covXY /= n - 1;

    const det = covXX * covYY - covXY * covXY;

    if (Math.abs(det) < 1e-10) {
        return data;
    }

    const invCovXX = covYY / det;
    const invCovYY = covXX / det;
    const invCovXY = -covXY / det;

    const distances = data.map((d) => {
        const dx = (d.amountRequested ?? 0) - meanX;
        const dy = (d.targetedPopulation ?? 0) - meanY;

        const distSq = dx * (invCovXX * dx + invCovXY * dy) + dy * (invCovXY * dx + invCovYY * dy);
        return Math.sqrt(Math.abs(distSq));
    });

    // Filter based on distance percentile
    const percentile = 0.975;
    const sortedDistances = [...distances].sort((a, b) => a - b);
    const thresholdIndex = Math.floor(sortedDistances.length * percentile);
    const threshold = sortedDistances[thresholdIndex];

    return data.filter((_, idx) => distances[idx] <= threshold);
}

export const AppealScatterChart = React.memo(function ScatterChart({
    title,
    appeals,
    highlightCountryId: highlightCountry,
    hideOutliers,
}: AppealScatterChartProps) {
    const filteredData = useMemo(() => {
        return hideOutliers ? removeOutliers(appeals) : appeals;
    }, [appeals, hideOutliers]);

    const [highlighted, norm] = useMemo(() => {
        return partition(filteredData, (appeal) => appeal.countryId === highlightCountry);
    }, [filteredData, highlightCountry]);

    return (
        <div className={styles.chartContainer}>
            {title && <AnnexSubtitle value={title} textColor="var(--go-ui-color-primary-red)" />}

            <div className={styles.responsiveWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <YAxis
                            type="number"
                            dataKey="amountRequested"
                            name="Total Amount Requested"
                            tickFormatter={abbreviateNumber}
                            tickLine={false}
                            axisLine={false}
                            label={{
                                value: 'Total Amount Requested (CHF)',
                                position: 'insideLeft',
                                angle: -90,
                                style: {
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    fill: AXIS_LABEL_COLOUR,
                                    textAnchor: 'middle',
                                },
                            }}
                        />
                        <XAxis
                            type="number"
                            dataKey="targetedPopulation"
                            name="Targeted Population"
                            tickFormatter={abbreviateNumber}
                            tickLine={false}
                            axisLine={false}
                            label={{
                                value: 'Targeted Population',
                                position: 'insideBottom',
                                offset: -10,
                                style: {
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    fill: AXIS_LABEL_COLOUR,
                                    textAnchor: 'middle',
                                },
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                        <ZAxis range={[20, 20]} />
                        <Scatter
                            data={norm}
                            fill="var(--go-ui-color-gray-50)"
                            isAnimationActive={false}
                        ></Scatter>
                        <Scatter
                            data={highlighted}
                            fill="var(--go-ui-color-primary-red)"
                            isAnimationActive={false}
                        ></Scatter>
                    </RechartsScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});
