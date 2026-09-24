import { fetchAllPages, getOrThrow } from '../client';
import type { paths, components } from '../types/generated';

const ENDPOINT = '/api/v2/country/' as const;

type CountryListResponse =
    paths[typeof ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type CountryList =
    paths[typeof ENDPOINT]['get']['responses'][200]['content']['application/json']['results'];

const COUNTRY_RECORD_TYPE_KEY: components['schemas']['ApiCountryTypeEnumKey'] = 1;

export async function getCountryList(): Promise<CountryList> {
    const data: CountryListResponse = await getOrThrow(ENDPOINT, {
        params: {
            query: {
                record_type: COUNTRY_RECORD_TYPE_KEY,
                is_nationalsociety: true,
                is_independent: true,
                is_deprecated: false,
            },
        },
    });

    return fetchAllPages(data);
}
