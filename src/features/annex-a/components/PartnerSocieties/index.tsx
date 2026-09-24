import styles from './styles.module.css';
import { Indicator } from '../../../annex-shared/components/Indicator';
import { type PartnerSocietiesProps } from '../../model';

export function PartnerSocieties(props: PartnerSocietiesProps) {
    const RENDER_PARTNERS = 8;

    // Take top 8 partners (pad with empty slots if fewer than 8)
    const renderPartners = props.partners.slice(0, RENDER_PARTNERS);

    const slots = Array.from({ length: RENDER_PARTNERS }).map((_, i) => {
        const partner = renderPartners[i];
        return (
            <div className={styles.cell} key={i}>
                {partner ? (
                    <Indicator value={partner} width="full" />
                ) : (
                    <div className={styles.empty} />
                )}
            </div>
        );
    });

    return <div className={styles.societyTable}>{slots}</div>;
}
