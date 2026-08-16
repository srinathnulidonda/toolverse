/* features/pdf/jpg-to-pdf/ts/jpgToPdfEngine.ts */
import jsPDF from "jspdf";
import type { ImageFileInfo } from "@/features/image/shared/ts/imageFileUtils";
import { downscaleImageIfNeeded } from "@/features/image/shared/ts/imageFileUtils";

export type PageSize = "a4" | "letter" | "fit-to-image";
export type Orientation = "portrait" | "landscape" | "auto";
export type Margin = "none" | "small" | "large";
export type ImageFit = "fit" | "fill";

export interface JpgToPdfSettings {
    pageSize: PageSize;
    orientation: Orientation;
    margin: Margin;
    imageFit: ImageFit;
}

export interface PageDimensions {
    width: number;
    height: number;
}

export interface ProcessingError {
    imageId: string;
    imageName: string;
    message: string;
}

export interface JpgToPdfResult {
    blob: Blob;
    pageCount: number;
    errors: ProcessingError[];
}

export type BuildStage = "preparing" | "rendering" | "encoding" | "finalizing";

export interface BuildProgress {
    stage: BuildStage;
    done: number;
    total: number;
}

type PageOrientation = "portrait" | "landscape";

interface PreparedPage {
    pageDims: PageDimensions;
    orientation: PageOrientation;
    placement: { x: number; y: number; width: number; height: number };
    processedDataUrl: string;
}

const PAGE_SIZES: Record<Exclude<PageSize, "fit-to-image">, PageDimensions> = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
};

const MARGIN_SIZES: Record<Margin, number> = {
    none: 0,
    small: 10,
    large: 20,
};

const TARGET_DPI = 150;
const JPEG_QUALITY = 0.85;

function mmToPixels(mm: number, dpi: number = TARGET_DPI): number {
    return Math.floor((mm / 25.4) * dpi);
}

function getPageDimensions(
    settings: JpgToPdfSettings,
    imageWidth: number,
    imageHeight: number
): PageDimensions {
    if (settings.pageSize === "fit-to-image") {
        const maxWidth = 210;
        const maxHeight = 297;
        const aspectRatio = imageWidth / imageHeight;

        if (aspectRatio > 1) {
            return { width: maxWidth, height: maxWidth / aspectRatio };
        }
        return { height: maxHeight, width: maxHeight * aspectRatio };
    }

    const baseDimensions = PAGE_SIZES[settings.pageSize];
    const shouldSwap =
        settings.orientation === "landscape" ||
        (settings.orientation === "auto" && imageWidth > imageHeight);

    if (shouldSwap) {
        return { width: baseDimensions.height, height: baseDimensions.width };
    }

    return baseDimensions;
}

function getOrientationFromDimensions(dims: PageDimensions): PageOrientation {
    return dims.width > dims.height ? "landscape" : "portrait";
}

function calculateImagePlacement(
    imageWidth: number,
    imageHeight: number,
    pageDimensions: PageDimensions,
    margin: number,
    imageFit: ImageFit
): { x: number; y: number; width: number; height: number } {
    const availableWidth = pageDimensions.width - 2 * margin;
    const availableHeight = pageDimensions.height - 2 * margin;

    const imageAspect = imageWidth / imageHeight;
    const availableAspect = availableWidth / availableHeight;

    let width: number;
    let height: number;

    if (imageFit === "fit") {
        if (imageAspect > availableAspect) {
            width = availableWidth;
            height = availableWidth / imageAspect;
        } else {
            height = availableHeight;
            width = availableHeight * imageAspect;
        }
    } else {
        if (imageAspect > availableAspect) {
            height = availableHeight;
            width = availableHeight * imageAspect;
        } else {
            width = availableWidth;
            height = availableWidth / imageAspect;
        }
    }

    const x = margin + (availableWidth - width) / 2;
    const y = margin + (availableHeight - height) / 2;

    return { x, y, width, height };
}

async function prepareImagePage(
    image: ImageFileInfo,
    settings: JpgToPdfSettings,
    marginSize: number
): Promise<PreparedPage> {
    const { dimensions, dataUrl } = image;

    if (!dimensions || !dataUrl) {
        throw new Error("Missing image data");
    }

    const pageDims = getPageDimensions(settings, dimensions.width, dimensions.height);
    const orientation = getOrientationFromDimensions(pageDims);

    const maxWidthMm = pageDims.width - 2 * marginSize;
    const maxHeightMm = pageDims.height - 2 * marginSize;
    const maxWidthPx = mmToPixels(maxWidthMm);
    const maxHeightPx = mmToPixels(maxHeightMm);

    const processedDataUrl = await downscaleImageIfNeeded(
        dataUrl,
        dimensions.width,
        dimensions.height,
        maxWidthPx,
        maxHeightPx,
        JPEG_QUALITY
    );

    const placement = calculateImagePlacement(
        dimensions.width,
        dimensions.height,
        pageDims,
        marginSize,
        settings.imageFit
    );

    return { pageDims, orientation, placement, processedDataUrl };
}

export async function buildPdf(
    images: ImageFileInfo[],
    settings: JpgToPdfSettings,
    onProgress?: (progress: BuildProgress) => void
): Promise<JpgToPdfResult> {
    const errors: ProcessingError[] = [];

    const validImages = images.filter((img) => {
        if (img.error || !img.dimensions || !img.dataUrl) {
            errors.push({
                imageId: img.id,
                imageName: img.file.name,
                message: img.error || "Failed to load image",
            });
            return false;
        }
        return true;
    });

    if (validImages.length === 0) {
        throw new Error("No valid images to process");
    }

    const marginSize = MARGIN_SIZES[settings.margin];
    const total = validImages.length;
    const prepared: PreparedPage[] = [];

    onProgress?.({ stage: "preparing", done: 0, total });

    for (let i = 0; i < validImages.length; i++) {
        const image = validImages[i];

        try {
            const page = await prepareImagePage(image, settings, marginSize);
            prepared.push(page);
        } catch (error) {
            errors.push({
                imageId: image.id,
                imageName: image.file.name,
                message: error instanceof Error ? error.message : "Failed to process image",
            });
        }

        onProgress?.({ stage: "rendering", done: i + 1, total });
    }

    if (prepared.length === 0) {
        throw new Error("Failed to create PDF: no pages could be generated");
    }

    const first = prepared[0];
    const pdf = new jsPDF({
        orientation: first.orientation,
        unit: "mm",
        format: [first.pageDims.width, first.pageDims.height],
        compress: true,
    });

    for (let i = 0; i < prepared.length; i++) {
        const page = prepared[i];

        if (i > 0) {
            pdf.addPage([page.pageDims.width, page.pageDims.height], page.orientation);
        }

        pdf.addImage(
            page.processedDataUrl,
            "JPEG",
            page.placement.x,
            page.placement.y,
            page.placement.width,
            page.placement.height,
            undefined,
            "FAST"
        );

        onProgress?.({ stage: "encoding", done: i + 1, total: prepared.length });
    }

    onProgress?.({ stage: "finalizing", done: 1, total: 1 });

    const blob = pdf.output("blob");

    return {
        blob,
        pageCount: prepared.length,
        errors,
    };
}