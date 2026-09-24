import { BlockView, Container } from '@ifrc-go/ui';
import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { ErrorState } from '../components/ErrorState';
import { Country, type AnnexParam } from '../features/country';

function parseAnnexParam(annexParam: string | null): AnnexParam {
    return annexParam === 'b' ? 'b' : 'a';
}

function parseCountryId(countryIdParam: string | undefined): number | null {
    if (!countryIdParam) {
        return null;
    }

    const parsed = Number(countryIdParam);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

function CountryRouteError({
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

export function CountryPage(): JSX.Element {
    const { countryId: countryIdParam } = useParams();
    const countryId = parseCountryId(countryIdParam);
    const [searchParams, setSearchParams] = useSearchParams();
    const annexParam = searchParams.get('annex');
    const annex = parseAnnexParam(annexParam);

    useEffect(() => {
        if (annexParam === 'a' || annexParam === 'b') {
            return;
        }

        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.set('annex', 'a');
        setSearchParams(nextSearchParams, { replace: true });
    }, [annexParam, searchParams, setSearchParams]);

    if (countryId == null) {
        return (
            <CountryRouteError
                title="Invalid country"
                description="The country identifier is invalid."
            />
        );
    }

    const handleAnnexChange = (nextAnnex: AnnexParam) => {
        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.set('annex', nextAnnex);
        setSearchParams(nextSearchParams, { replace: true });
    };

    return <Country countryId={countryId} annex={annex} onAnnexChange={handleAnnexChange} />;
}
