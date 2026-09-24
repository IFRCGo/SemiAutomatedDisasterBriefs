import { AlignmentType, BorderStyle, Paragraph, TextRun } from 'docx';

export const RED = 'F5333F';
export const BLUE = '002244';
export const GREY = '666666';
export const LIGHT_GREY = 'F0F0F0';

// Fonts
export const FONT_HEADING = 'Montserrat';
export const FONT_BODY = 'Open Sans';

export const TITLE_SIZE = 48;
export const SUBTITLE_SIZE = 42;
export const TEXT_SIZE = 24;

export function createTitle(content: string, colour?: string) {
    return new Paragraph({
        spacing: { after: 100 },
        children: [
            new TextRun({
                text: content,
                bold: true,
                size: TITLE_SIZE,
                font: FONT_HEADING,
                color: colour ?? RED,
            }),
        ],
    });
}

export function createSubtitle(content: string) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
            new TextRun({
                text: content,
                bold: true,
                size: SUBTITLE_SIZE,
                font: FONT_HEADING,
            }),
        ],
    });
}

export function createBlueDivider() {
    return new Paragraph({
        border: {
            bottom: {
                color: BLUE,
                space: 1,
                style: BorderStyle.SINGLE,
                size: TITLE_SIZE,
            },
        },
        spacing: { before: 0, after: 200 },
    });
}

export function createAiSummary(summary?: string) {
    const displayString = summary ?? 'AI summary failed to load.';

    // TODO: use an ifrc colour.
    return new Paragraph({
        spacing: { before: 100, after: 200 },
        children: [
            new TextRun({
                text: displayString,
                size: 20,
                font: FONT_BODY,
                color: '#333333',
            }),
        ],
    });
}

/**
 * Returns the necessary scale for the docx image to be rendered
 */
export function getScale(elem: HTMLElement, scale: number = 1) {
    const DOCUMENT_PIXEL_WIDTH = 794;

    const rect = elem.getBoundingClientRect();
    const imgWidth = Math.max(1, Math.round(rect.width * scale));
    const imgHeight = Math.max(1, Math.round(rect.height * scale));

    const ratio = DOCUMENT_PIXEL_WIDTH / imgWidth;
    return {
        width: Math.max(1, Math.round(imgWidth * ratio * scale)),
        height: Math.max(1, Math.round(imgHeight * ratio * scale)),
    };
}
