import { useMemo, useState } from 'react';
import { BlockView, Button, Container, TextOutput } from '@ifrc-go/ui';

import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { IndicatorGroup } from './components/IndicatorGroup';
import { ChartGroup } from './components/ChartGroup';
import { AnnexSeparator } from '../annex-shared/components/AnnexSeparator';
import { AnnexTitle } from '../annex-shared/components/AnnexTitle';
import { PartnerSocieties } from './components/PartnerSocieties';
import { exportAnnexA } from '../../services/export/annexA';
import { buildAiSummaryPrompt } from './prompts/aiSummaryPrompt';
import { useAiSummary } from '../../services/ai/useAiSummary';
import { Indicator } from '../annex-shared/components/Indicator';
import { IncomePieChart } from './components/IncomePieChart';
import { getApiErrorMessage } from '../../api/error/getApiErrorMessage';
import { useAlert } from '../../App/AlertProvider';
import { useAnnexAData } from './hooks/useAnnexAData';

import styles from './styles.module.css';

export interface AnnexAProps {
    country: {
        id: number;
        name: string;
        iso3: string;
    };
}

export function AnnexA({ country }: AnnexAProps): JSX.Element {
    const annexAData = useAnnexAData(country.id, country.iso3);
    const [isExporting, setIsExporting] = useState(false);
    const { show } = useAlert();

    const aiSummaryText = useMemo(() => {
        if (annexAData.status !== 'ready') {
            return null;
        }

        const { databank, incomeTally, partners, branchCount } = annexAData.data;

        return buildAiSummaryPrompt({ country, databank, incomeTally, partners, branchCount });
    }, [annexAData, country]);

    const summaryState = useAiSummary({
        key: country.id,
        text: aiSummaryText,
        enabled: annexAData.status === 'ready',
    });

    switch (annexAData.status) {
        case 'error':
            return (
                <Container>
                    <BlockView withPadding={true}>
                        <BlockView className={styles.sectionCard}>
                            <div className={styles.sectionBody}>
                                <ErrorState
                                    title="Unable to load country data"
                                    description={getApiErrorMessage(annexAData.error)}
                                />
                            </div>
                        </BlockView>
                    </BlockView>
                </Container>
            );

        case 'pending':
            return (
                <Container>
                    <BlockView withPadding={true}>
                        <BlockView className={styles.sectionCard}>
                            <div className={styles.sectionBody}>
                                <LoadingState message="Loading country data" />
                            </div>
                        </BlockView>
                    </BlockView>
                </Container>
            );

        case 'ready': {
            const {
                icrcPresence,
                databank,
                partners,
                incomeTally,
                branchCount,
                peopleReachedCount,
                historicalKpiData: historicalData,
            } = annexAData.data;

            const indicatorGroupProps = {
                label: 'Key FDRS Indicators',
                volunteers: databank?.fdrs_volunteer_total,
                branchCount,
                staff: databank?.fdrs_staff_total,
                income: databank?.fdrs_income,
                peopleReachedCount,
                expenditure: databank?.fdrs_expenditures,
            };

            const incomeChartID = 'incomePie';
            const trendChartID = 'trendChart';

            const handleExport = async () => {
                setIsExporting(true);
                try {
                    await exportAnnexA({
                        aiSummary: aiSummaryText ?? undefined,
                        country,
                        keyIndicators: indicatorGroupProps,
                        incomeChartID,
                        trendChartID,
                        icrcPresence,
                        partnerSocieties: { partners },
                    });
                } catch (error) {
                    const description =
                        error instanceof Error
                            ? error.message
                            : 'Could not export Word document. Please try again.';

                    show('annex-a-export-failed', 'Export failed', description);
                } finally {
                    setIsExporting(false);
                }
            };

            return (
                <Container>
                    <BlockView withPadding={true}>
                        {!isExporting && (
                            <Button
                                name="Export"
                                onClick={handleExport}
                                styleVariant="transparent"
                                textSize="lg"
                            >
                                Export to Word
                            </Button>
                        )}

                        <BlockView className={styles.sectionCard}>
                            <div className={styles.sectionBody}>
                                <div className={styles.annex}>
                                    <div id="annexTitle">
                                        <AnnexSeparator
                                            value={`ANNEX A - ${country.name.toUpperCase()} AT A GLANCE`}
                                            textColor="var(--go-ui-color-primary-red)"
                                        />
                                    </div>
                                    <div className={styles.annexText}>
                                        {summaryState.summary ? (
                                            <TextOutput value={summaryState.summary} />
                                        ) : (
                                            <LoadingState message="Generating AI Summary..." />
                                        )}
                                    </div>
                                    <div>
                                        <div className={styles.charts}>
                                            <div className={styles.chartsLeft}>
                                                <IndicatorGroup {...indicatorGroupProps} />
                                                <IncomePieChart
                                                    data={incomeTally}
                                                    id={incomeChartID}
                                                />
                                            </div>
                                            <div className={styles.chartsRight}>
                                                <AnnexTitle value={`Last ${2} Years Trends`} />
                                                <ChartGroup
                                                    id={trendChartID}
                                                    branchCount={historicalData.branchCount}
                                                    staff={historicalData.staff}
                                                />
                                            </div>
                                        </div>
                                        <AnnexSeparator value="Movement Coordination" />
                                        <div className={styles.textIndicators}>
                                            <div className={styles.textIndicatorsLeft}>
                                                <div className={styles.alignCentre}>
                                                    <AnnexTitle value="ICRC Presence" />
                                                </div>
                                                <div className={styles.alignCentre}>
                                                    <Indicator
                                                        width="partial"
                                                        value={icrcPresence ? 'Yes' : 'No'}
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.textIndicatorsRight}>
                                                <div className={styles.alignCentre}>
                                                    <AnnexTitle value="Partners" />
                                                </div>
                                                <div className={styles.alignCentre}>
                                                    <PartnerSocieties
                                                        partners={
                                                            partners.length > 0
                                                                ? partners
                                                                : ['None']
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </BlockView>
                    </BlockView>
                </Container>
            );
        }
    }
}
