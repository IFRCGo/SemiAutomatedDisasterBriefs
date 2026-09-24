import { BlockView, InlineLayout, TextOutput } from '@ifrc-go/ui';

import styles from './styles.module.css';

export interface ErrorStateProps {
    title: string;
    description?: string;
}

export function ErrorState({ title, description }: ErrorStateProps): JSX.Element {
    return (
        <BlockView className={styles.block}>
            <InlineLayout spacing="sm">
                <TextOutput value={title} strongLabel />
                {description && <TextOutput value={description} textSize="sm" />}
            </InlineLayout>
        </BlockView>
    );
}
