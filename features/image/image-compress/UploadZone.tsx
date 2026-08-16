// features/image/image-compress/UploadZone.tsx
"use client";

import { GenericUploadZone } from "@/components/shared/GenericUploadZone";

export function UploadZone({ onFilesAdded, isProcessing }: {
    onFilesAdded: (files: File[]) => void;
    isProcessing: boolean;
}) {
  return (
    <GenericUploadZone<"image">
      acceptType="image"
      onFilesAdded={onFilesAdded}
      isProcessing={isProcessing}
      headingText="Compress Images"
      descriptionText="Reduce image file sizes without losing visible quality. Drag & drop your images here, or click to browse."
      browseButtonText="Browse Images"
      hintText="Multiple files supported — your images never leave this device"
      acceptedTypesText="JPG, PNG, WebP"
    />
  );
}