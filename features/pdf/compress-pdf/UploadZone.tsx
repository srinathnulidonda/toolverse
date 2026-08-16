// features/pdf/compress-pdf/UploadZone.tsx
import { GenericUploadZone } from "@/components/shared/GenericUploadZone";

export function UploadZone({ onFileSelected, isProcessing }: {
    onFileSelected: (file: File) => void;
    isProcessing: boolean;
}) {
  return (
    <GenericUploadZone<"pdf">
      acceptType="pdf"
      allowMultiple={false}
      onFilesAdded={(files) => {
        if (files.length > 0) {
          onFileSelected(files[0]);
        }
      }}
      isProcessing={isProcessing}
      headingText="Compress PDF File"
      descriptionText="Reduce PDF file size while maintaining quality. Drag & drop your file here, or click to browse."
      browseButtonText="Browse File"
      hintText="Select a single PDF file to compress"
      acceptedTypesText="PDF only"
    />
  );
}