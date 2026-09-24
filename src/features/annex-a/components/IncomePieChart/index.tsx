import { type IncomeBreakdown } from '../../../../hooks/country/useIncomeBreakdown';
import { AnnexPieChart } from '../TopPieChart';
import { AnnexSubtitle } from '../../../annex-shared/components/AnnexSubtitle';
import { AnnexTitle } from '../../../annex-shared/components/AnnexTitle';

export interface IncomePieProps {
    data: IncomeBreakdown;
    id?: string;
}

export function IncomePieChart({ data, id }: IncomePieProps) {
    const values = [data.government, data.ifrc, data.icrc, data.other];
    const insufficient = values.every((x) => x === 0);

    return (
        <div id={id}>
            <AnnexSubtitle value="Income Sources" />
            {insufficient ? (
                <AnnexTitle value="-" />
            ) : (
                <AnnexPieChart labels={['Government', 'IFRC', 'ICRC', 'Other']} values={values} />
            )}
        </div>
    );
}
