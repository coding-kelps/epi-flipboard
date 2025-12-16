import probe from 'probe-image-size';

export async function checkImageResolution(url: string, minWidth: number = 800): Promise<boolean> {
    if (!url) return false;

    try {
        const result = await probe(url);
        return result.width >= minWidth;
    } catch (error) {
        console.warn(`Failed to probe image ${url}:`, error);
        // If we can't check, assume it's bad to be safe, or good?
        // User wants to AVOID low res, so better to be strict.
        return false;
    }
}
