import { UploadedFile } from '@/lib/storage';

interface PreviewPaneProps {
  file: UploadedFile | null;
}

const PreviewPane = ({ file }: PreviewPaneProps) => {
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
