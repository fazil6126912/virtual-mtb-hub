import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { UploadedFile } from '@/lib/storage';

interface ZoomablePreviewProps {
  file: UploadedFile | null;
}

/**
 * ZoomablePreview component provides zoom and pan functionality for file previews.
 * Uses react-zoom-pan-pinch for smooth interactions.
 * Supports pinch-to-zoom on mobile and mouse wheel + drag on desktop.
 */
const ZoomablePreview = ({ file }: ZoomablePreviewProps) => {
  if (!file) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        Select a file to preview
      </div>
    );
  }

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={file.dataURL}
          alt={file.name}
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
      );
    }

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

  // For PDFs and text, use simple scroll; for images, use zoom/pan
  if (file.type === 'application/pdf' || file.type === 'text/plain') {
    return (
      <div className="w-full h-full overflow-auto bg-background hide-scrollbar">
        {renderPreview()}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background relative overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: 'reset' }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom Controls */}
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <button
                onClick={() => zoomIn()}
                className="w-8 h-8 bg-background/90 border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => zoomOut()}
                className="w-8 h-8 bg-background/90 border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => resetTransform()}
                className="w-8 h-8 bg-background/90 border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Fit to view"
              >
                <Maximize className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Zoomable Content */}
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full flex items-center justify-center"
            >
              {renderPreview()}
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default ZoomablePreview;