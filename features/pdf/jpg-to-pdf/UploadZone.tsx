// features/pdf/jpg-to-pdf/UploadZone.tsx
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
      headingText="Convert Images to PDF"
      descriptionText="Transform your JPG, PNG, or WebP images into a professional PDF document. Drag & drop your files here, or click to browse."
      browseButtonText="Browse Images"
      hintText="Multiple files supported — reorder pages after upload"
      acceptedTypesText="JPG, PNG, WebP"
    />
  );
}