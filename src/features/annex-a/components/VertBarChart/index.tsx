import styles from './styles.module.css';
import { BarChart, Bar, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnnexSubtitle } from '../../../annex-shared/components/AnnexSubtitle';

// IFRC Red
const IFRC_RED = '#F5333F';

type Props = {
    labels: string[];
    values: number[];
    title?: string;
    colour?: string;
    className?: string;
};

/**
 * React component to generate a vertical bar chart, since IFRC ui's barchart is horizontal-aligned.
 */
export function VertBarChart({ labels, values, title, colour }: Props) {
    const data = labels.map((label, index) => ({
        label,
        value: values[index] ?? 0,
    }));

    return (
        <div className={/*[styles.chart, className].filter(Boolean).join(' ')*/ styles.chart}>
            {title && <AnnexSubtitle value={title} />}
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="label" axisLine={false} tickLine={false} />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill={colour ?? IFRC_RED} stroke="black" strokeWidth={1}>
                        <LabelList
                            dataKey="value"
                            position="top"
                            fontWeight="bold"
                            fontFamily="'Montserrat', sans-serif;"
                            fill="black"
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
