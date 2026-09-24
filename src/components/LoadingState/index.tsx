import { BlockLoading } from '@ifrc-go/ui';

export interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message }: LoadingStateProps): JSX.Element {
    return <BlockLoading withoutBorder={true} message={message ?? 'Fetching data...'} />;
}
