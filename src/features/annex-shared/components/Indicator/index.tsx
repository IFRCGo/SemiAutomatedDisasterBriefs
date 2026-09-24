import styles from './styles.module.css';
import { abbreviateNumber } from '../../utils/abbreviate';

/**
 * A single indicator (with the background) as shown on annex A.
 */
export interface IndicatorProps {
    value?: number | string;
    label?: string;
    year?: string;
    className?: string;
    width?: 'full' | 'partial';
}

export function Indicator(props: IndicatorProps) {
    let displayString: string;
    if (props.value == null) {
        displayString = '-';
    } else if (typeof props.value === 'string') {
        displayString = props.value;
    } else {
        displayString = abbreviateNumber(props.value);
    }

    const indicatorClasses = [
        styles.indicator,
        props.className ?? '',
        props.width === 'partial' ? styles.partial : '',
    ].join(' ');
    const boxClasses = [styles.indicatorBox, props.width === 'full' ? styles.full : ''].join(' ');

    return (
        <div className={indicatorClasses}>
            <div className={boxClasses}>
                <h2 className={styles.indicatorValue}>{displayString}</h2>
            </div>

            {props.label && <p className={styles.indicatorLabel}>{props.label}</p>}
            {props.year != null && <p className={styles.indicatorLabel}>[{props.year}]</p>}
        </div>
    );
}
