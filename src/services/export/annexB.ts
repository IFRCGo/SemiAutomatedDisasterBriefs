import {
    Document,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    ImageRun,
    VerticalAlign,
    ShadingType,
    TableLayoutType,
} from 'docx';
import { abbreviateNumber } from '../../features/annex-shared/utils/abbreviate';
import { downloadDocx, toU8Array } from './utils';
import {
    BLUE,
    createAiSummary,
    createBlueDivider,
    FONT_BODY,
    FONT_HEADING,
    GREY,
    LIGHT_GREY,
    RED,
} from './wordExport';
import type {
    CountryActiveAppealStats,
    CountryHistoricalAppealStats,
    RegionActiveAppealStats,
} from '../../hooks/appeal';

// Standard IFRC colors
const PAGE_WIDTH_DXA = 10466;

const formatValue = (val: number | string | null | undefined) => {
    if (val == null) return '-';
    if (typeof val === 'string') return val;
    return abbreviateNumber(val);
};

const getDisasterHeaderText = (disasterName?: string) => {
    if (!disasterName) {
        return 'ALL DISASTERS';
    }

    return disasterName.toUpperCase();
};

const getDisasterInlinePrefix = (disasterName?: string) => {
    if (!disasterName) {
        return '';
    }

    return `${disasterName} `;
};

const createIndicatorGrid = (
    indicators: { label: string; value: number | string | null | undefined }[]
) => {
    const exactColWidth = Math.floor(PAGE_WIDTH_DXA / indicators.length);

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        columnWidths: indicators.map(() => exactColWidth),
        borders: {
            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideVertical: { style: BorderStyle.SINGLE, size: 12, color: BLUE },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        },
        rows: [
            new TableRow({
                children: indicators.map(
                    (ind) =>
                        new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            shading: { type: ShadingType.CLEAR, fill: LIGHT_GREY },
                            margins: { top: 150, bottom: 150, left: 100, right: 100 },
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: formatValue(ind.value),
                                            bold: true,
                                            size: 36,
                                            font: FONT_HEADING,
                                            color: BLUE,
                                        }),
                                    ],
                                }),
                            ],
                        })
                ),
            }),
            new TableRow({
                children: indicators.map(
                    (ind) =>
                        new TableCell({
                            verticalAlign: VerticalAlign.TOP,
                            margins: { top: 100, bottom: 100, left: 100, right: 100 },
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: ind.label,
                                            bold: true,
                                            size: 18,
                                            font: FONT_BODY,
                                            color: RED,
                                        }),
                                    ],
                                }),
                            ],
                        })
                ),
            }),
        ],
    });
};

export interface ExportAnnexBDataArgs {
    countryName: string;
    disasterName?: string;
    chartEAsBase64: string | null;
    chartDREFsBase64: string | null;
    aiSummary?: string | null;
    activeCountryAppealStats: CountryActiveAppealStats;
    historicalCountryAppealStats: CountryHistoricalAppealStats;
    activeRegionAppealStats: RegionActiveAppealStats;
}

export async function exportAnnexBData({
    countryName,
    disasterName,
    chartEAsBase64,
    chartDREFsBase64,
    aiSummary,
    activeCountryAppealStats,
    historicalCountryAppealStats,
    activeRegionAppealStats,
}: ExportAnnexBDataArgs) {
    const disasterHeaderText = getDisasterHeaderText(disasterName);
    const disasterInlinePrefix = getDisasterInlinePrefix(disasterName);

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
                },
                children: [
                    new Paragraph({
                        spacing: { after: 100 },
                        children: [
                            new TextRun({
                                text: `ANNEX B - ${disasterHeaderText} APPEALS OVERVIEW`,
                                bold: true,
                                size: 32, // 16pt
                                font: FONT_HEADING,
                                color: BLUE,
                            }),
                        ],
                    }),
                    createBlueDivider(),
                    createAiSummary(aiSummary ? aiSummary : undefined),

                    new Paragraph({
                        spacing: { after: 200, before: 100 },
                        children: [
                            new TextRun({
                                text: `${countryName.toUpperCase()} ACTIVE APPEALS`,
                                bold: true,
                                size: 24,
                                font: FONT_HEADING,
                                color: BLUE,
                            }),
                        ],
                    }),

                    createIndicatorGrid([
                        {
                            label: `Active ${disasterInlinePrefix}EAs`,
                            value: activeCountryAppealStats.eaCount,
                        },
                        {
                            label: `Active ${disasterInlinePrefix}DREFs`,
                            value: activeCountryAppealStats.drefCount,
                        },
                        {
                            label: '# of targeted people',
                            value: activeCountryAppealStats.targetedPeopleCount,
                        },
                        {
                            label: 'Total amount of funding (CHF)',
                            value: activeCountryAppealStats.totalFunding,
                        },
                        {
                            label: 'Median cost per beneficiary (CHF)',
                            value: activeCountryAppealStats.medianCostPerBeneficiary,
                        },
                    ]),

                    new Paragraph({
                        spacing: { after: 300, before: 400 },
                        children: [
                            new TextRun({
                                text: '2000-PRESENT TRENDS',
                                bold: true,
                                size: 24,
                                font: FONT_HEADING,
                                color: BLUE,
                            }),
                        ],
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        layout: TableLayoutType.FIXED,
                        columnWidths: [1, 2, 3, 4, 5, 6].map(() => Math.floor(PAGE_WIDTH_DXA / 6)),
                        borders: {
                            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE },
                            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 12, color: BLUE },
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    '',
                                    '# of appeals',
                                    'Median targeted people',
                                    'Median funding requested (CHF)',
                                    'Median appeal coverage',
                                    'Median cost per beneficiary (CHF)',
                                ].map(
                                    (text, idx) =>
                                        new TableCell({
                                            margins: {
                                                top: 150,
                                                bottom: 150,
                                                left: 100,
                                                right: 100,
                                            },
                                            children: [
                                                new Paragraph({
                                                    alignment:
                                                        idx === 0
                                                            ? AlignmentType.LEFT
                                                            : AlignmentType.CENTER,
                                                    children: [
                                                        new TextRun({
                                                            text,
                                                            bold: true,
                                                            size: 18,
                                                            font: FONT_BODY,
                                                            color: GREY,
                                                        }),
                                                    ],
                                                }),
                                            ],
                                        })
                                ),
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        margins: { top: 150, bottom: 150 },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: 'EAS',
                                                        bold: true,
                                                        size: 22,
                                                        font: FONT_HEADING,
                                                        color: RED,
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    ...[
                                        formatValue(historicalCountryAppealStats.ea.count),
                                        formatValue(
                                            historicalCountryAppealStats.ea.medianTargetedPeople
                                        ),
                                        formatValue(
                                            historicalCountryAppealStats.ea.medianFundingRequested
                                        ),
                                        formatValue(historicalCountryAppealStats.ea.medianCoverage),
                                        formatValue(
                                            historicalCountryAppealStats.ea.medianCostPerBeneficiary
                                        ),
                                    ].map(
                                        (val) =>
                                            new TableCell({
                                                margins: { top: 150, bottom: 150 },
                                                children: [
                                                    new Paragraph({
                                                        alignment: AlignmentType.CENTER,
                                                        children: [
                                                            new TextRun({
                                                                text: val,
                                                                bold: true,
                                                                size: 28,
                                                                font: FONT_HEADING,
                                                                color: BLUE,
                                                            }),
                                                        ],
                                                    }),
                                                ],
                                            })
                                    ),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        margins: { top: 150, bottom: 150 },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: 'DREFS',
                                                        bold: true,
                                                        size: 22,
                                                        font: FONT_HEADING,
                                                        color: RED,
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    ...[
                                        formatValue(historicalCountryAppealStats.dref.count),
                                        formatValue(
                                            historicalCountryAppealStats.dref.medianTargetedPeople
                                        ),
                                        formatValue(
                                            historicalCountryAppealStats.dref.medianFundingRequested
                                        ),
                                        formatValue(
                                            historicalCountryAppealStats.dref.medianCoverage
                                        ),
                                        formatValue(
                                            historicalCountryAppealStats.dref
                                                .medianCostPerBeneficiary
                                        ),
                                    ].map(
                                        (val) =>
                                            new TableCell({
                                                margins: { top: 150, bottom: 150 },
                                                children: [
                                                    new Paragraph({
                                                        alignment: AlignmentType.CENTER,
                                                        children: [
                                                            new TextRun({
                                                                text: val,
                                                                bold: true,
                                                                size: 28,
                                                                font: FONT_HEADING,
                                                                color: BLUE,
                                                            }),
                                                        ],
                                                    }),
                                                ],
                                            })
                                    ),
                                ],
                            }),
                        ],
                    }),

                    createBlueDivider(),

                    new Paragraph({
                        spacing: { after: 200, before: 100 },
                        children: [
                            new TextRun({
                                text: 'DREFS AND EMERGENCY APPEALS IN THE REGION',
                                bold: true,
                                size: 24,
                                font: FONT_HEADING,
                                color: BLUE,
                            }),
                        ],
                    }),

                    createIndicatorGrid([
                        {
                            label: `Active ${disasterInlinePrefix}EAs`,
                            value: activeRegionAppealStats.eaCount,
                        },
                        {
                            label: 'Median funding requested (CHF)',
                            value: activeRegionAppealStats.medianEaAmountRequested,
                        },
                        {
                            label: '% of funding coverage',
                            value: activeRegionAppealStats.fundingCoverage,
                        },
                        {
                            label: `Active ${disasterInlinePrefix}DREFs`,
                            value: activeRegionAppealStats.drefCount,
                        },
                        {
                            label: 'Median funding requested (CHF)',
                            value: activeRegionAppealStats.medianDrefAmountRequested,
                        },
                    ]),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        layout: TableLayoutType.FIXED,
                        columnWidths: [
                            Math.floor(PAGE_WIDTH_DXA / 2),
                            Math.floor(PAGE_WIDTH_DXA / 2),
                        ],
                        borders: {
                            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        margins: { top: 300, right: 100 },
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: chartEAsBase64
                                                    ? [
                                                          new ImageRun({
                                                              data: toU8Array(chartEAsBase64),
                                                              type: 'png',
                                                              transformation: {
                                                                  width: 340,
                                                                  height: 260,
                                                              },
                                                          }),
                                                      ]
                                                    : [],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        margins: { top: 300, left: 100 },
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: chartDREFsBase64
                                                    ? [
                                                          new ImageRun({
                                                              data: toU8Array(chartDREFsBase64),
                                                              type: 'png',
                                                              transformation: {
                                                                  width: 340,
                                                                  height: 260,
                                                              },
                                                          }),
                                                      ]
                                                    : [],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    await downloadDocx(doc, `Annex_B_${countryName}.docx`);
}
