/* features/pdf/jpg-to-pdf/ts/jpgToPdfConfig.ts */
import type { PageSize, Orientation, Margin, ImageFit } from "./jpgToPdfEngine";

export interface PageSizeOption {
    value: PageSize;
    label: string;
    description: string;
}

export interface OrientationOption {
    value: Orientation;
    label: string;
    description: string;
}

export interface MarginOption {
    value: Margin;
    label: string;
    description: string;
}

export interface ImageFitOption {
    value: ImageFit;
    label: string;
    description: string;
}

export const PAGE_SIZE_OPTIONS: PageSizeOption[] = [
    {
        value: "a4",
        label: "A4",
        description: "210 × 297 mm",
    },
    {
        value: "letter",
        label: "Letter",
        description: "8.5 × 11 in",
    },
    {
        value: "fit-to-image",
        label: "Fit to Image",
        description: "Match image size",
    },
];

export const ORIENTATION_OPTIONS: OrientationOption[] = [
    {
        value: "auto",
        label: "Auto",
        description: "Detect per image",
    },
    {
        value: "portrait",
        label: "Portrait",
        description: "Vertical pages",
    },
    {
        value: "landscape",
        label: "Landscape",
        description: "Horizontal pages",
    },
];

export const MARGIN_OPTIONS: MarginOption[] = [
    {
        value: "none",
        label: "None",
        description: "No padding",
    },
    {
        value: "small",
        label: "Small",
        description: "10mm margin",
    },
    {
        value: "large",
        label: "Large",
        description: "20mm margin",
    },
];

export const IMAGE_FIT_OPTIONS: ImageFitOption[] = [
    {
        value: "fit",
        label: "Fit",
        description: "Scale to fit, preserve aspect ratio",
    },
    {
        value: "fill",
        label: "Fill",
        description: "Scale to fill page, may crop",
    },
];

export const DEFAULT_SETTINGS = {
    pageSize: "a4" as PageSize,
    orientation: "auto" as Orientation,
    margin: "small" as Margin,
    imageFit: "fit" as ImageFit,
};