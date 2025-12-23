import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UploadedFile } from '@/lib/storage';

interface PreviewPaneProps {
  file: UploadedFile | null;
}

/**
 * PreviewPane component for displaying file previews.
 * For PDFs: displays anonymized pages if available, with page navigation.
 */
const PreviewPane = ({ file }: PreviewPaneProps) => {
  const [currentPdfPageIndex, setCurrentPdfPageIndex] = useState(0);

  if (!file) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        Select a file to preview
      </div>
    );
  }

  // Check if this PDF has anonymized pages
  const hasAnonymizedPages = file.type === 'application/pdf' && 
    file.anonymizedPages && 
    file.anonymizedPages.length > 0;

  const renderPreview = () => {
    // Use anonymized image if available, otherwise use original
    const imageSource = file.anonymizedDataURL || file.dataURL;

    if (file.type.startsWith('image/')) {
      return (
        <img
          src={imageSource}
          alt={file.name}
          className="max-w-full max-h-full object-contain"
        />
      );
    }

    // For PDFs with anonymized pages, render as images with page navigation
    if (hasAnonymizedPages) {
      const totalPages = file.anonymizedPages!.length;
      const currentPageSrc = file.anonymizedPages![currentPdfPageIndex];
      
      return (
        <div className="flex flex-col items-center w-full h-full">
          {/* Page navigation for multi-page PDFs */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 py-2 bg-background/80 backdrop-blur-sm sticky top-0 z-10 w-full justify-center border-b border-border">
              <button
                onClick={() => setCurrentPdfPageIndex(prev => Math.max(0, prev - 1))}
                disabled={currentPdfPageIndex === 0}
                className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-muted-foreground">
                Page {currentPdfPageIndex + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPdfPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPdfPageIndex === totalPages - 1}
                className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
            <img
              src={currentPageSrc}
              alt={`${file.name} - Page ${currentPdfPageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      );
    }

    // For non-anonymized PDFs, use iframe (original behavior)
    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={file.dataURL}
          title={file.name}
          className="w-full h-full"
        />
      );
    }

    if (file.type === 'text/plain') {
      // Decode base64 text content
      const base64Content = file.dataURL.split(',')[1];
      const textContent = atob(base64Content);
      return (
        <pre className="p-4 text-sm text-foreground whitespace-pre-wrap font-mono">
          {textContent}
        </pre>
      );
    }

    return (
      <div className="text-center text-muted-foreground">
        Preview not available for this file type
      </div>
    );
  };

  return (
    <div className="w-full h-full overflow-auto bg-background border border-border rounded-lg">
      {renderPreview()}
    </div>
  );
};

export default PreviewPane;
