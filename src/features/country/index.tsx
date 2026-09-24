import { BlockView, Container, PageContainer, Tab, TabList, Tabs } from '@ifrc-go/ui';
import { Link } from 'react-router-dom';

import { getApiErrorMessage } from '../../api/error/getApiErrorMessage';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { useCountry } from '../../hooks/country/useCountry';
import { AnnexA } from '../annex-a';
import { AnnexB } from '../annex-b';
import { CountryHeader } from './components/CountryHeader';

export type AnnexParam = 'a' | 'b';

interface CountryProps {
    countryId: number;
    annex: AnnexParam;
    onAnnexChange: (nextAnnex: AnnexParam) => void;
}

function CountryError({
    title,
    description,
}: {
    title: string;
    description?: string;
}): JSX.Element {
    return (
        <Container>
            <BlockView withPadding={true}>
                <Link to="/">Back to country list</Link>
                <ErrorState title={title} description={description} />
            </BlockView>
        </Container>
    );
}

export function Country({ countryId, annex, onAnnexChange }: CountryProps): JSX.Element {
    const countryQuery = useCountry(countryId);

    if (countryQuery.status === 'pending') {
        return (
            <Container>
                <BlockView withPadding={true}>
                    <LoadingState message="Loading country" />
                </BlockView>
            </Container>
        );
    }

    if (countryQuery.status === 'error') {
        return (
            <CountryError
                title="Unable to load country"
                description={getApiErrorMessage(countryQuery.error)}
            />
        );
    }

    if (!countryQuery.data || !countryQuery.data.id) {
        return (
            <CountryError title="Country not found" description="This country is not available." />
        );
    }

    const { data: countryData } = countryQuery;
    const countryName = countryData.name ?? '';
    const countryIso3 = countryData.iso3 ?? '';
    const countryRegionId = countryData.region ?? null;

    if (!countryName || !countryIso3 || countryRegionId == null) {
        return (
            <CountryError
                title="Country data unavailable"
                description="Required country fields are missing for this record."
            />
        );
    }

    return (
        <PageContainer>
            <CountryHeader countryName={countryName} />
            <Tabs value={annex} onChange={onAnnexChange} styleVariant="tab">
                <TabList>
                    <Tab name="a">Annex A View</Tab>
                    <Tab name="b">Annex B View</Tab>
                </TabList>
            </Tabs>
            {annex === 'a' && (
                <AnnexA
                    country={{
                        id: countryData.id,
                        name: countryName,
                        iso3: countryIso3,
                    }}
                />
            )}
            {annex === 'b' && (
                <AnnexB
                    country={{
                        id: countryData.id,
                        name: countryName,
                        regionId: countryRegionId,
                    }}
                />
            )}
        </PageContainer>
    );
}
