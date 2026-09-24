import styles from './styles.module.css';

export interface AnnexSubTitleProps {
    value: string;
    textColor?: string;
}

export function AnnexSubtitle(props: AnnexSubTitleProps) {
    return (
        <h3
            className={styles.title}
            style={props.textColor ? { color: props.textColor } : undefined}
        >
            {props.value}
        </h3>
    );
}
