import { getOrThrow } from '../client';
import type { paths } from '../types/generated';

const ENDPOINT = '/api/v2/country/{id}/databank/' as const;

type CountryDatabankResponse =
    paths[typeof ENDPOINT]['get']['responses'][200]['content']['application/json'];

export async function getCountryDatabank(countryId: number): Promise<CountryDatabankResponse> {
    const data: CountryDatabankResponse = await getOrThrow(ENDPOINT, {
        params: {
            path: {
                id: countryId,
            },
        },
    });

    return data;
}
