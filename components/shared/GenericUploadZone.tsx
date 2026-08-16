// components/shared/GenericUploadZone.tsx
import { useCallback, useRef, useState } from 'react';
import './style/GenericUploadZone.css';

type UploadZoneProps<T extends 'image' | 'pdf'> = {
  onFilesAdded: (files: File[]) => void;
  isProcessing: boolean;
  acceptType: T;
  allowMultiple?: boolean;
  headingText?: string;
  descriptionText?: string;
  browseButtonText?: string;
  hintText?: string;
  acceptedTypesText?: string;
};

export function GenericUploadZone<T extends 'image' | 'pdf'>({
  onFilesAdded,
  isProcessing,
  acceptType,
  allowMultiple = false,
  headingText,
  descriptionText,
  browseButtonText,
  hintText,
  acceptedTypesText,
}: UploadZoneProps<T>) {
  const [dragOver, setDragOver] = useState(false);
  const [rejectionErrors, setRejectionErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const acceptedTypes =
    acceptType === 'image'
      ? (['image/jpeg', 'image/png', 'image/webp'] as const)
      : (['application/pdf'] as const);

  const acceptedExtensions =
    acceptType === 'image'
      ? (['.jpg', '.jpeg', '.png', '.webp'] as const)
      : (['.pdf'] as const);

  const validateAndProcessFiles = useCallback((fileList: FileList) => {
    const files = Array.from(fileList);
    const validFiles: File[] = [];
    const rejected: string[] = [];

    files.forEach((file) => {
      const isValidByType = file.type && acceptedTypes.some(type => type === file.type);
      const isValidByExtension = acceptedExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (isValidByType || isValidByExtension) {
        validFiles.push(file);
      } else {
        rejected.push(
          `${file.name} — ${
            acceptType === 'image'
              ? 'not a supported image format'
              : 'not a PDF file'
          }`
        );
      }
    });

    if (acceptType === 'pdf' && !allowMultiple && validFiles.length > 1) {
      setRejectionErrors(['Please upload only one PDF file at a time']);
      return;
    }

    setRejectionErrors(rejected);

    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  }, [acceptType, allowMultiple, onFilesAdded, acceptedTypes, acceptedExtensions]);

  const openPicker = useCallback(() => {
    if (!isProcessing) fileInputRef.current?.click();
  }, [isProcessing]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isProcessing) return;
    dragCounter.current += 1;
    setDragOver(true);
  }, [isProcessing]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOver(false);

    if (isProcessing) return;

    validateAndProcessFiles(e.dataTransfer.files);
  }, [validateAndProcessFiles, isProcessing]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndProcessFiles(e.target.files);
    }
    e.target.value = '';
  }, [validateAndProcessFiles]);

  return (
    <div className="generic-upload-container">
      <div
        className={`generic-upload-zone ${dragOver ? 'drag-over' : ''} ${isProcessing ? 'disabled' : ''}`}
        onClick={openPicker}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${acceptType === 'image' ? 'image' : 'PDF'} files — click or drag and drop`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
      >
        <div className="generic-upload-content">
          <div className="generic-upload-icon-wrapper">
            <i
              className={`ti ${
                dragOver
                  ? acceptType === 'image'
                    ? 'ti-photo-plus'
                    : 'ti-file-plus'
                  : 'ti-upload'
              }`}
              aria-hidden="true"
            />
          </div>

          <h2 className="generic-main-heading">
            {dragOver
              ? `Drop your ${acceptType === 'image' ? 'images' : 'PDFs'} here`
              : headingText ||
                (acceptType === 'image'
                  ? 'Compress Images'
                  : 'Merge PDF Files')}
          </h2>
          
          <p className="generic-main-description">
            {descriptionText ||
              (acceptType === 'image'
                ? 'Reduce image file sizes without losing visible quality. Drag & drop your images here, or click to browse.'
                : 'Combine multiple PDF documents into a single file. Drag & drop your files here, or click to browse.')}
          </p>

          <button
            type="button"
            className="generic-browse-button"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
            disabled={isProcessing}
          >
            <i className="ti ti-folder-open" aria-hidden="true" />
            <span>{browseButtonText || 'Browse Files'}</span>
          </button>

          <div className="generic-format-row">
            <span className="generic-format-chip">
              <i
                className={`ti ${
                  acceptType === 'image'
                    ? 'ti-file-type-jpg'
                    : 'ti-file-type-pdf'
                }`}
                aria-hidden="true"
              />
              {acceptedTypesText ||
                (acceptType === 'image'
                  ? 'JPG, PNG, WebP'
                  : 'PDF only')}
            </span>
            {allowMultiple && acceptType === 'pdf' && (
              <span className="generic-format-chip">
                <i className="ti ti-stack-2" aria-hidden="true" />
                2+ files required
              </span>
            )}
          </div>

          <p className="generic-upload-hint">
            {hintText ||
              (acceptType === 'image'
                ? 'Multiple files supported — your images never leave this device'
                : 'Reorder pages after upload — everything happens locally in your browser')}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={allowMultiple || acceptType === 'image'}
          className="generic-hidden-input"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
      </div>

      {rejectionErrors.length > 0 && (
        <div className="generic-error-list" role="alert">
          <div className="generic-error-header">
            <i className="ti ti-alert-circle" aria-hidden="true" />
            <span>Some files were rejected</span>
          </div>
          {rejectionErrors.map((error, index) => (
            <div key={index} className="generic-error-item">
              <i className="ti ti-x" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}