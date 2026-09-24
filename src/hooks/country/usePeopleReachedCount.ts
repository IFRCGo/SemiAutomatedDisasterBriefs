import { ProjectListResponse, getProjects } from '../../api/endpoints/project';
import { useQuery } from '@tanstack/react-query';

type ProjectList = NonNullable<ProjectListResponse['results']>;

function toPeopleReachedCount(projects: ProjectList): number {
    return projects.reduce((acc, project) => {
        return acc + (project.reached_total ?? 0);
    }, 0);
}

export function usePeopleReachedCount(countryId: number) {
    return useQuery({
        queryKey: ['projects', countryId],
        queryFn: () => getProjects(countryId),
        select: (data) => toPeopleReachedCount(data.results),
    });
}
