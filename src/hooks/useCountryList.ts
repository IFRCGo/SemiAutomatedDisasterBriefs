import { CountryList, getCountryList } from '../api/endpoints/countryList';
import { useQuery } from '@tanstack/react-query';

export type Country = {
    id: number;
    name: string;
    society: string;
};

function toCountries(countryList: CountryList): Country[] {
    const countries: Country[] = [];

    countryList.forEach((country) => {
        if (country.name && country.society_name) {
            countries.push({
                id: country.id,
                name: country.name,
                society: country.society_name,
            });
        }
    });

    return countries;
}

export function useCountryList() {
    return useQuery({
        queryKey: ['countryList'],
        queryFn: () => getCountryList(),
        select: toCountries,
    });
}
