import html2canvas from 'html2canvas';

/**
 * Exports an HTML canvas as an image
 */
export async function toImage(element: HTMLElement): Promise<string> {
    try {
        const canvas = await html2canvas(element);

        return canvas.toDataURL('image/png');
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to render chart image: ${error.message}`);
        }

        throw new Error('Failed to render chart image');
    }
}

/**
 * Exports an HTML canvas as its pure base64 representation.
 */
export async function toImageBase64(element: HTMLElement): Promise<string> {
    const data = await toImage(element);
    const base64 = data.split(',')[1];

    if (!base64) {
        throw new Error('Failed to encode chart image');
    }

    return base64;
}
