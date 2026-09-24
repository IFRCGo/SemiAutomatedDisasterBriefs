import { Button, ListView, PageHeader } from '@ifrc-go/ui';
import { Link } from 'react-router-dom';

export interface CountryHeaderProps {
    countryName: string;
}

export function CountryHeader({ countryName }: CountryHeaderProps): JSX.Element {
    return (
        <ListView layout="block" withCenteredContents={true} withPadding={true}>
            <PageHeader heading={countryName} />
            <Link to="/">
                <Button name="back" styleVariant="action">
                    &lt; Back to list
                </Button>
            </Link>
        </ListView>
    );
}
