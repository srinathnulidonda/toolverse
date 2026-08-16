// features/image/remove-bg/UploadZone.tsx
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
      headingText="Remove Background"
      descriptionText="Remove backgrounds from images automatically. Drag & drop your images here, or click to browse."
      browseButtonText="Browse Images"
      hintText="Multiple files supported — your images never leave this device"
      acceptedTypesText="JPG, PNG, WebP"
    />
  );
}