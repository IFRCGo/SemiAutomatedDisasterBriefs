import createClient from 'openapi-fetch';
import type { ClientPathsWithMethod, FetchOptions } from 'openapi-fetch';

import type { paths } from './types/generated';

const API_BASE_URL = 'https://goadmin.ifrc.org';

export const apiClient = createClient<paths>({
    baseUrl: API_BASE_URL,
});

type GetPath = ClientPathsWithMethod<typeof apiClient, 'get'>;

type GetOperation<P extends GetPath> = paths[P]['get'];

type PaginatedLike = {
    next?: string | null;
    results: unknown[];
};

type ResultItem<TPage extends PaginatedLike> = TPage['results'][number];

export async function getOrThrow<P extends GetPath>(path: P, init: FetchOptions<GetOperation<P>>) {
    const { data, error } = await apiClient.GET(path, init);
    if (error) {
        throw error;
    }

    if (data === undefined) {
        throw new Error(`No data returned for GET ${path}`);
    }

    return data;
}

export async function fetchAllPages<TPage extends PaginatedLike>(
    firstPage: TPage
): Promise<ResultItem<TPage>[]> {
    const results: ResultItem<TPage>[] = firstPage.results;
    let next = firstPage.next;

    while (next) {
        const response = await fetch(next);
        if (!response.ok) {
            throw new Error(`Failed to fetch country list page: ${response.status}`);
        }

        const data: TPage = await response.json();

        results.push(...data.results);

        next = data.next;
    }

    return results;
}
