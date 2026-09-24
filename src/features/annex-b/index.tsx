import { useState, useMemo } from 'react';
import { BlockView, Button, Checkbox, Container, SelectInput, TextOutput } from '@ifrc-go/ui';

import { TrendsTable } from './components/TrendsTable';
import { LoadingState } from '../../components/LoadingState';
import { toImageBase64 } from '../../services/export/imageExport';
import { exportAnnexBData } from '../../services/export/annexB';

import { AnnexSeparator } from '../annex-shared/components/AnnexSeparator';
import { AppealScatterChart } from './components/AppealScatterChart';
import { type DisasterType, DISASTER_TYPES } from '../../api/types/disasterType';
import { useAiSummary } from '../../services/ai/useAiSummary';
import { buildAiSummaryPrompt } from './prompts/aiSummaryPrompt';
import { useAnnexBData } from './hooks/useAnnexBData';
import { getRegionName, type ApiRegionNameEnumKey } from '../../api/types/regionName';

import styles from './styles.module.css';
import { Indicator } from '../annex-shared/components/Indicator';
import { ErrorState } from '../../components/ErrorState';
import { getApiErrorMessage } from '../../api/error/getApiErrorMessage';
import { useAlert } from '../../App/AlertProvider';

export interface AnnexBProps {
    country: {
        id: number;
        name: string;
        regionId: number;
    };
}

type DisasterFilter = 'all' | DisasterType;

const DISASTER_OPTIONS: { value: DisasterFilter }[] = [
    { value: 'all' },
    ...DISASTER_TYPES.map((disaster) => ({ value: disaster })),
];

function getDisasterFilterLabel(filter: DisasterFilter): string {
    if (filter === 'all') {
        return 'All disasters';
    }

    return filter;
}

function getDisasterInlinePrefix(filter: DisasterFilter): string {
    if (filter === 'all') {
        return '';
    }

    return `${filter} `;
}

function getDisasterLoadingText(filter: DisasterFilter): string {
    if (filter === 'all') {
        return 'all disaster';
    }

    return filter.toLowerCase();
}

export function AnnexB({ country }: AnnexBProps): JSX.Element {
    const [disasterFilter, setDisasterFilter] = useState<DisasterFilter>('all');
    const [hideOutliers, setHideOutliers] = useState<boolean>(false);
    const [isExporting, setIsExporting] = useState(false);
    const { show } = useAlert();
    const disasterType = disasterFilter === 'all' ? undefined : disasterFilter;

    const regionName = getRegionName(country.regionId as ApiRegionNameEnumKey);

    const annexBData = useAnnexBData(country.id, country.regionId, disasterType);

    const aiPrompt = useMemo(() => {
        if (annexBData.status !== 'ready') {
            return null;
        }

        return buildAiSummaryPrompt({
            countryName: country.name,
            disasterName: disasterType,
            activeCountryAppealStats: annexBData.data.activeCountryStats,
            historicalCountryAppealStats: annexBData.data.historicalCountryStats,
            activeRegionAppealStats: annexBData.data.activeRegionStats,
        });
    }, [annexBData, country.name, disasterType]);

    const aiSummary = useAiSummary({
        key: `annex-b-${country.id}-${disasterFilter}`,
        text: aiPrompt,
        enabled: annexBData.status === 'ready',
    }).summary;

    switch (annexBData.status) {
        case 'error':
            return (
                <Container>
                    <BlockView className={styles.sectionCard}>
                        <ErrorState
                            title="Unable to load appeals"
                            description={getApiErrorMessage(annexBData.error)}
                        />
                    </BlockView>
                </Container>
            );

        case 'pending':
            return (
                <Container>
                    <BlockView className={styles.sectionCard}>
                        <LoadingState
                            message={`Loading ${getDisasterLoadingText(disasterFilter)} data...`}
                        />
                    </BlockView>
                </Container>
            );

        case 'ready': {
            const {
                activeCountryStats: activeCountryAppealStats,
                historicalCountryStats: historicalCountryAppealStats,
                activeRegionStats: activeRegionAppealStats,
                historicalRegionAppeals,
            } = annexBData.data;

            const handleExport = async () => {
                setIsExporting(true);
                try {
                    const easChartElem = document.getElementById('scatter-eas-export');
                    const drefsChartElem = document.getElementById('scatter-drefs-export');

                    const chartEAsBase64 = easChartElem ? await toImageBase64(easChartElem) : null;
                    const chartDREFsBase64 = drefsChartElem
                        ? await toImageBase64(drefsChartElem)
                        : null;

                    await exportAnnexBData({
                        countryName: country.name,
                        disasterName: disasterType,
                        chartEAsBase64,
                        chartDREFsBase64,
                        aiSummary: aiSummary,
                        activeCountryAppealStats,
                        historicalCountryAppealStats,
                        activeRegionAppealStats,
                    });
                } catch (error) {
                    const description =
                        error instanceof Error
                            ? error.message
                            : 'Could not export Word document. Please try again.';

                    show('annex-b-export-failed', 'Export failed', description);
                } finally {
                    setIsExporting(false);
                }
            };

            return (
                <Container>
                    <div className={styles.pageStack}>
                        <div className={styles.headerRow}>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'last baseline',
                                    alignContent: 'center',
                                }}
                            >
                                <SelectInput
                                    name="Select Disaster"
                                    options={DISASTER_OPTIONS}
                                    onChange={(value: DisasterFilter | undefined) => {
                                        setDisasterFilter(value ?? 'all');
                                    }}
                                    keySelector={(option) => option.value}
                                    labelSelector={(option) => getDisasterFilterLabel(option.value)}
                                    value={disasterFilter}
                                    label={'Disaster type filter'}
                                />

                                <Button
                                    name="Export to Word"
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    styleVariant="transparent"
                                >
                                    {isExporting ? 'Exporting...' : 'Export to word'}
                                </Button>
                            </div>
                        </div>

                        <BlockView className={styles.sectionCard}>
                            <div className={styles.annex}>
                                <div style={{ backgroundColor: 'white' }}>
                                    <AnnexSeparator
                                        value={`ANNEX B - ${getDisasterFilterLabel(disasterFilter).toUpperCase()} APPEALS OVERVIEW`}
                                        textColor="var(--go-ui-color-primary-red)"
                                    />
                                </div>

                                <div className={styles.exportWrapper}>
                                    <div
                                        style={{
                                            paddingBottom: '1rem',
                                            fontSize: '0.95rem',
                                            fontFamily: 'Montserrat, sans-serif',
                                            color: '#333',
                                            lineHeight: '1.6',
                                        }}
                                    >
                                        {aiSummary ? (
                                            <TextOutput value={aiSummary} />
                                        ) : (
                                            <LoadingState
                                                message={`Generating AI summary for ${getDisasterLoadingText(disasterFilter)} appeals...`}
                                            />
                                        )}
                                    </div>

                                    <div className={styles.chartSection}>
                                        <div className={styles.sectionTitle}>
                                            ACTIVE APPEALS IN {country.name}
                                        </div>
                                        <div className={styles.indicatorGrid5}>
                                            <Indicator
                                                width="full"
                                                value={activeCountryAppealStats.eaCount}
                                                label={`Active ${getDisasterInlinePrefix(disasterFilter)}EAs`}
                                            />
                                            <Indicator
                                                width="full"
                                                value={activeCountryAppealStats.drefCount}
                                                label={`Active ${getDisasterInlinePrefix(disasterFilter)}DREFs`}
                                            />
                                            <Indicator
                                                width="full"
                                                value={activeCountryAppealStats.targetedPeopleCount}
                                                label="# of targeted people"
                                            />
                                            <Indicator
                                                width="full"
                                                value={activeCountryAppealStats.totalFunding}
                                                label="Total funding (CHF)"
                                            />
                                            <Indicator
                                                width="full"
                                                value={
                                                    activeCountryAppealStats.medianCostPerBeneficiary
                                                }
                                                label="Median cost per beneficiary (CHF)"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.chartSection}>
                                        <div
                                            className={styles.sectionTitle}
                                        >{`HISTORICAL APPEALS IN ${country.name.toUpperCase()} (2000-PRESENT)`}</div>
                                        <TrendsTable {...historicalCountryAppealStats} />
                                    </div>

                                    <div className={styles.chartSection}>
                                        <div
                                            className={styles.sectionTitle}
                                        >{`ACTIVE APPEALS IN THE ${regionName.toUpperCase()} REGION`}</div>
                                        <div className={styles.indicatorGrid5}>
                                            <Indicator
                                                width="full"
                                                value={activeRegionAppealStats.eaCount}
                                                label={`Active ${getDisasterInlinePrefix(disasterFilter)}EAs`}
                                            />
                                            <Indicator
                                                width="full"
                                                value={
                                                    activeRegionAppealStats.medianEaAmountRequested
                                                }
                                                label="Median EA funding requested (CHF)"
                                            />
                                            <Indicator
                                                width="full"
                                                value={`${Math.round(activeRegionAppealStats.fundingCoverage)}%`}
                                                label="Funding coverage"
                                            />
                                            <Indicator
                                                width="full"
                                                value={activeRegionAppealStats.drefCount}
                                                label={`Active ${getDisasterInlinePrefix(disasterFilter)}DREFs`}
                                            />
                                            <Indicator
                                                width="full"
                                                value={
                                                    activeRegionAppealStats.medianDrefAmountRequested
                                                }
                                                label="Median DREF funding requested (CHF)"
                                            />
                                        </div>
                                    </div>

                                    <BlockView className={styles.chartsPanel}>
                                        <div
                                            className={styles.sectionTitle}
                                        >{`Historical ${getDisasterInlinePrefix(disasterFilter)}Appeals in the ${regionName} region (2000-Present)`}</div>
                                        <div className={styles.outlierToggle}>
                                            <Checkbox
                                                name="toggleOutliers"
                                                label="Hide outliers"
                                                onChange={setHideOutliers}
                                                value={hideOutliers}
                                            />
                                        </div>
                                        <div className={styles.chartsGrid}>
                                            <div id="scatter-eas-export">
                                                <AppealScatterChart
                                                    title="EAs"
                                                    appeals={historicalRegionAppeals.ea}
                                                    highlightCountryId={country.id}
                                                    hideOutliers={hideOutliers}
                                                />
                                            </div>
                                            <div id="scatter-drefs-export">
                                                <AppealScatterChart
                                                    title="DREFs"
                                                    appeals={historicalRegionAppeals.dref}
                                                    highlightCountryId={country.id}
                                                    hideOutliers={hideOutliers}
                                                />
                                            </div>
                                        </div>
                                    </BlockView>
                                </div>
                            </div>
                        </BlockView>
                    </div>
                </Container>
            );
        }
    }
}
