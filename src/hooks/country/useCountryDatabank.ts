import { getCountryDatabank } from '../../api/endpoints/countryDatabank';
import { useQuery } from '@tanstack/react-query';

export function useCountryDatabank(countryId: number) {
    return useQuery({
        queryKey: ['countryDatabank', countryId],
        queryFn: () => getCountryDatabank(countryId),
    });
}
