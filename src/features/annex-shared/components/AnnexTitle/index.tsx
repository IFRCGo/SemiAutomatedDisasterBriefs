import styles from './styles.module.css';

export interface AnnexTitleProps {
    value: string;
    color?: string;
}

export function AnnexTitle(props: AnnexTitleProps) {
    return (
        <h1
            className={styles.title}
            style={{
                color: props.color ?? 'black',
            }}
        >
            {props.value}
        </h1>
    );
}
