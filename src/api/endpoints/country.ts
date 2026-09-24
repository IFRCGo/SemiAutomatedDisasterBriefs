import { getOrThrow } from '../client';
import type { paths } from '../types/generated';

const ENDPOINT = '/api/v2/country/{id}/' as const;

type CountryResponse =
    paths[typeof ENDPOINT]['get']['responses'][200]['content']['application/json'];

export async function getCountry(countryId: number): Promise<CountryResponse> {
    const data: CountryResponse = await getOrThrow(ENDPOINT, {
        params: {
            path: {
                id: countryId,
            },
        },
    });

    return data;
}
