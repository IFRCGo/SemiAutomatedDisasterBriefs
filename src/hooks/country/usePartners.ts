import { CountryPlanResponse, getCountryPlan } from '../../api/endpoints/countryPlan';
import { useQuery } from '@tanstack/react-query';

type UsePartnersOptions = {
    enabled?: boolean;
};

function toPartners(plan: CountryPlanResponse): string[] {
    const partners = (plan.membership_coordinations ?? [])
        .filter(
            (coord): coord is typeof coord & { national_society_name: string } =>
                coord.has_coordination === true && typeof coord.national_society_name === 'string'
        )
        .map((coord) => coord.national_society_name);

    return [...new Set(partners)];
}

export function usePartners(countryId: number, options?: UsePartnersOptions) {
    return useQuery({
        queryKey: ['countryPlan', countryId],
        queryFn: () => getCountryPlan(countryId),
        select: toPartners,
        enabled: options?.enabled ?? true,
    });
}
