import { getOrThrow } from '../client';
import type { paths } from '../types/generated';

const ENDPOINT = '/api/v2/project/' as const;

export type ProjectListResponse =
    paths[typeof ENDPOINT]['get']['responses'][200]['content']['application/json'];

export async function getProjects(countryId: number): Promise<ProjectListResponse> {
    const data: ProjectListResponse = await getOrThrow(ENDPOINT, {
        params: {
            query: {
                reporting_ns: [countryId],
            },
        },
    });

    return data;
}
