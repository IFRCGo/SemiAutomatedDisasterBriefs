import { Link } from 'react-router-dom';
import { type ComponentType, type ReactNode } from 'react';

import { CountryList } from '../features/country-list';
import { type Country } from '../hooks/useCountryList';

type RouterLinkProps = {
    to: string;
    children: ReactNode;
    className?: string;
};

function countryToPath(country: Country): string {
    return `/country/${country.id}`;
}

export function CountryListPage(): JSX.Element {
    return (
        <CountryList
            countryToPath={countryToPath}
            LinkComponent={Link as ComponentType<RouterLinkProps>}
        />
    );
}
