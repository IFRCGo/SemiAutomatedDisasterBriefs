import { type ComponentType, type ReactNode, useMemo, useState } from 'react';
import {
    BlockView,
    Button,
    Container,
    ListView,
    PageContainer,
    PageHeader,
    TextInput,
    TextOutput,
} from '@ifrc-go/ui';

import { LoadingState } from '../../components/LoadingState';
import { useCountryList } from '../../hooks/useCountryList';
import { type Country } from '../../hooks/useCountryList';
import styles from './styles.module.css';
import { ErrorState } from '../../components/ErrorState';
import { getApiErrorMessage } from '../../api/error/getApiErrorMessage';

interface Props {
    onSelectItem?: (country: Country) => void;
    countryToPath?: (country: Country) => string;
    LinkComponent?: ComponentType<{
        to: string;
        children: ReactNode;
        className?: string;
    }>;
}

export function CountryList({ onSelectItem, countryToPath, LinkComponent }: Props): JSX.Element {
    const { data, error, status } = useCountryList();

    const [query, setQuery] = useState<string>('');

    const filteredCountries = useMemo(() => {
        return (data ?? []).filter(
            (country) =>
                country.name.toLowerCase().includes(query.toLowerCase()) ||
                (country.society && country.society.toLowerCase().includes(query.toLowerCase()))
        );
    }, [data, query]);

    switch (status) {
        case 'error':
            return (
                <Container>
                    <BlockView withPadding={true}>
                        <BlockView className={styles.sectionCard}>
                            <div className={styles.sectionBody}>
                                <ErrorState
                                    title="Unable to load countries"
                                    description={getApiErrorMessage(error)}
                                />
                            </div>
                        </BlockView>
                    </BlockView>
                </Container>
            );

        case 'pending':
            return (
                <Container>
                    <BlockView withPadding={true}>
                        <BlockView className={styles.sectionCard}>
                            <div className={styles.sectionBody}>
                                <LoadingState message="Loading countries" />
                            </div>
                        </BlockView>
                    </BlockView>
                </Container>
            );

        case 'success': {
            return (
                <PageContainer>
                    <PageHeader heading="Annex Generator" />
                    <TextInput
                        name="Country search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e ?? '');
                        }}
                        placeholder="Search for country"
                    />
                    <hr className={styles.separator} />
                    <ListView layout="grid" numPreferredGridColumns={3}>
                        {filteredCountries.map((country) => (
                            <BlockView key={country.id} className={styles.card}>
                                <ListView layout="block">
                                    <Button
                                        name={country.name + 'button'}
                                        styleVariant="action"
                                        onClick={
                                            countryToPath
                                                ? undefined
                                                : () => onSelectItem?.(country)
                                        }
                                        textSize="lg"
                                        withoutPadding={true}
                                    >
                                        {countryToPath && LinkComponent ? (
                                            <LinkComponent
                                                to={countryToPath(country)}
                                                className={styles.countryLink}
                                            >
                                                {country.name} &gt;
                                            </LinkComponent>
                                        ) : (
                                            `${country.name} >`
                                        )}
                                    </Button>
                                    <TextOutput
                                        value={country.society}
                                        textSize="md"
                                        withLightText={true}
                                        className={styles.society}
                                    />
                                </ListView>
                            </BlockView>
                        ))}
                    </ListView>
                </PageContainer>
            );
        }
    }
}
