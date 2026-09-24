import { getOrThrow } from '../client';
import type { paths } from '../types/generated';

const ENDPOINT = '/api/v2/country-plan/{country}/' as const;

export type CountryPlanResponse =
    paths[typeof ENDPOINT]['get']['responses'][200]['content']['application/json'];

export async function getCountryPlan(countryPlanId: number): Promise<CountryPlanResponse> {
    const data: CountryPlanResponse = await getOrThrow(ENDPOINT, {
        params: {
            path: {
                country: countryPlanId,
            },
        },
    });

    return data;
}
