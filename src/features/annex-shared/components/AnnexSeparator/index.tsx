import { AnnexTitle } from '../AnnexTitle';
import styles from './styles.module.css';

export interface AnnexSeparatorProps {
    value: string;
    color?: string;
    textColor?: string;
}

export function AnnexSeparator(props: AnnexSeparatorProps) {
    return (
        <div>
            <div className={styles.leftAlign}>
                <AnnexTitle value={props.value} color={props.textColor} />
            </div>
            <div
                className={styles.bar}
                style={{
                    backgroundColor: props.color ?? 'var(--go-ui-color-primary-blue)',
                }}
            />
        </div>
    );
}
