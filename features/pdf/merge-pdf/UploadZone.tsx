// features/pdf/merge-pdf/UploadZone.tsx
import { GenericUploadZone } from "@/components/shared/GenericUploadZone";

export function UploadZone({ onFilesAdded, isProcessing }: {
    onFilesAdded: (files: File[]) => void;
    isProcessing: boolean;
}) {
  return (
    <GenericUploadZone<"pdf">
      acceptType="pdf"
      allowMultiple={true}
      onFilesAdded={onFilesAdded}
      isProcessing={isProcessing}
      headingText="Merge PDF Files"
      descriptionText="Combine multiple PDF documents into a single file. Drag & drop your files here, or click to browse."
      browseButtonText="Browse Files"
      hintText="Reorder pages after upload — everything happens locally in your browser"
      acceptedTypesText="PDF only"
    />
  );
}