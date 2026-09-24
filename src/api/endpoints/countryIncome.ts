import { getOrThrow } from '../client';
import type { components, paths } from '../types/generated';

const ENDPOINT = '/api/v2/country-income/' as const;

export type FDRSIncome = components['schemas']['FDRSIncome'][];
type CountryIncomeResponse =
    paths[typeof ENDPOINT]['get']['responses'][200]['content']['application/json'];

export async function getCountryIncome(countryId: number): Promise<FDRSIncome> {
    const data: CountryIncomeResponse = await getOrThrow(ENDPOINT, {
        params: {
            query: {
                country: countryId,
            },
        },
    });

    return data.results ?? [];
}
