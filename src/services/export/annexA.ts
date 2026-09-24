import {
    BorderStyle,
    Document,
    ImageRun,
    Paragraph,
    AlignmentType,
    ShadingType,
    Table,
    TableCell,
    TableLayoutType,
    TableRow,
    TextRun,
    VerticalAlign,
    WidthType,
} from 'docx';
import { toImageBase64 } from './imageExport';
import { downloadDocx, toU8Array } from './utils';
import {
    BLUE,
    createAiSummary,
    createBlueDivider,
    createSubtitle,
    createTitle,
    FONT_BODY,
    getScale,
    LIGHT_GREY,
    RED,
    SUBTITLE_SIZE,
    TEXT_SIZE,
} from './wordExport';
import { abbreviateNumber } from '../../features/annex-shared/utils/abbreviate';
import {
    getIndicators,
    type IndicatorGroupProps,
    type PartnerSocietiesProps,
} from '../../features/annex-a/model';

export interface ExportAnnexAData {
    country: {
        name: string;
    };
    aiSummary?: string;
    keyIndicators: IndicatorGroupProps;
    incomeChartID: string; // HTML element ID of the income chart
    trendChartID: string; // The HTML element ID of the charts
    icrcPresence: boolean;
    partnerSocieties: PartnerSocietiesProps;
}

function createIndicatorPair(
    first: { label: string; value?: number | null },
    second: { label: string; value?: number | null }
) {
    const createCell = (text: string, isValue: boolean) => {
        const valueCellMargins = { top: 150, bottom: 150, left: 100, right: 100 };
        const labelCellMargins = { top: 0, bottom: 300, left: 100, right: 100 };

        const shading = isValue ? { type: ShadingType.CLEAR, fill: LIGHT_GREY } : {};
        const margins = isValue ? valueCellMargins : labelCellMargins;
        const verticalAlign = isValue ? VerticalAlign.CENTER : VerticalAlign.TOP;
        const spacing = isValue ? undefined : { before: 0, after: 0 };

        return new TableCell({
            shading,
            margins,
            verticalAlign,
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing,
                    children: [
                        new TextRun({
                            text,
                            font: FONT_BODY,
                            size: isValue ? SUBTITLE_SIZE : undefined,
                            color: isValue ? BLUE : RED,
                            bold: true,
                        }),
                    ],
                }),
            ],
        });
    };

    const create = (first: string, second: string, isValue: boolean) => {
        return new TableRow({
            children: [createCell(first, isValue), createCell(second, isValue)],
        });
    };

    const valueRow = create(
        first.value ? abbreviateNumber(first.value) : '-',
        second.value ? abbreviateNumber(second.value) : '-',
        true
    );

    const labelRow = create(first.label, second.label, false);

    return [valueRow, labelRow];
}

function createIndicatorGroup(data: IndicatorGroupProps) {
    const tableHeader = new TableRow({
        children: [
            new TableCell({
                children: [createSubtitle('Key FDRS Indicators')],
            }),
        ],
    });

    const indicators = getIndicators(data);

    const indicatorEntires = Object.entries(indicators);

    const indicatorRows: TableRow[] = [];

    for (let i = 0; i < indicatorEntires.length; i += 2) {
        indicatorRows.push(
            ...createIndicatorPair(indicatorEntires[i][1], indicatorEntires[i + 1][1])
        );
    }

    return new Table({
        borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
        },

        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [tableHeader, ...indicatorRows],
    });
}

function createMovementCoordination(icrcPresence: boolean, partnerSocieties: string[]) {
    const partners = partnerSocieties.slice(0, 8);

    const createGridCell = (text: string) =>
        new TableCell({
            shading: text ? { type: ShadingType.CLEAR, fill: LIGHT_GREY } : {},
            margins: { top: 120, bottom: 120, left: 100, right: 100 },
            verticalAlign: VerticalAlign.TOP,
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 0 },
                    children: [
                        new TextRun({
                            text,
                            font: FONT_BODY,
                            bold: true,
                            size: TEXT_SIZE,
                        }),
                    ],
                }),
            ],
        });

    const header = new TableRow({
        children: [
            new TableCell({
                children: [createSubtitle('ICRC Presence')],
            }),
            new TableCell({
                columnSpan: 2,
                children: [createSubtitle('Partner Societies')],
            }),
        ],
    });

    const rows: TableRow[] = [];
    const partnerRowCount = Math.min(Math.max(1, Math.ceil(partners.length / 2)), 4);

    for (let i = 0; i < partnerRowCount; i += 1) {
        const left = i === 0 ? (icrcPresence ? 'Yes' : 'No') : '';
        const partnerLeft = partners[i * 2] ?? '';
        const partnerRight = partners[i * 2 + 1] ?? '';

        rows.push(
            new TableRow({
                children: [
                    createGridCell(left),
                    createGridCell(partnerLeft),
                    createGridCell(partnerRight),
                ],
            })
        );
    }

    return new Table({
        borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
        },

        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [header, ...rows],
    });
}

async function toImageParagraph(elem: HTMLElement, scale?: number) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new ImageRun({
                data: toU8Array(await toImageBase64(elem)),
                type: 'png',
                transformation: getScale(elem, scale),
            }),
        ],
    });
}

export async function exportAnnexA(data: ExportAnnexAData) {
    const trendChartElem = document.getElementById(data.trendChartID);
    if (trendChartElem === null) {
        throw new Error('Trend chart was not found for export');
    }

    const incomeChartElem = document.getElementById(data.incomeChartID);
    if (incomeChartElem === null) {
        throw new Error('Income chart was not found for export');
    }

    const chartsLeft = [
        createIndicatorGroup(data.keyIndicators),
        await toImageParagraph(incomeChartElem, 0.4),
    ];

    const chartsRight: Paragraph[] = [
        createSubtitle('Last 2 Years Trends'),
        await toImageParagraph(trendChartElem, 0.4),
    ];

    const charts = new Table({
        borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
        },
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.TOP,
                        children: chartsLeft,
                    }),
                    new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.TOP,
                        children: chartsRight,
                    }),
                ],
            }),
        ],
    });

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
                },
                children: [
                    createTitle(`ANNEX A - ${data.country.name.toUpperCase()} AT A GLANCE`),
                    createBlueDivider(),
                    createAiSummary(data.aiSummary),
                    charts,
                    createTitle('Movement Coordination', '000000'),
                    createBlueDivider(),
                    createMovementCoordination(data.icrcPresence, data.partnerSocieties.partners),
                ],
            },
        ],
    });

    await downloadDocx(doc, `${data.country.name}-annex-a.docx`);
}
