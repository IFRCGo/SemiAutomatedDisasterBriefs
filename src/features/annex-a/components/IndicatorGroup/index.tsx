import styles from './styles.module.css';
import { Indicator } from '../../../annex-shared/components/Indicator';
import { AnnexTitle } from '../../../annex-shared/components/AnnexTitle';
import { getIndicators, type IndicatorGroupProps } from '../../model';

export function IndicatorGroup(props: IndicatorGroupProps) {
    const indicators = getIndicators(props);

    return (
        <div>
            <AnnexTitle value={props.label} />
            <div className={styles.table}>
                {indicators.map((item) => (
                    <Indicator
                        key={item.label}
                        label={item.label}
                        value={item.value ?? undefined}
                    />
                ))}
            </div>
        </div>
    );
}
