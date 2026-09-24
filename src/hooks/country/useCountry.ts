import { getCountry } from '../../api/endpoints/country';
import { useQuery } from '@tanstack/react-query';

export function useCountry(countryId: number) {
    return useQuery({
        queryKey: ['country', countryId],
        queryFn: () => getCountry(countryId),
    });
}
