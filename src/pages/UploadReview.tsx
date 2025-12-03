import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Header from '@/components/Header';
import FileCard from '@/components/FileCard';
import FileUploadDropzone from '@/components/FileUploadDropzone';
import { useApp } from '@/contexts/AppContext';
import { UploadedFile, generateMockExtractedData } from '@/lib/storage';
import { toast } from 'sonner';

const UploadReview = () => {
  const navigate = useNavigate();
  const { state, addUploadedFile, removeUploadedFile, updateFileCategory, updateFileExtractedData } = useApp();

  const handleFilesAdded = (files: UploadedFile[]) => {
    files.forEach(file => addUploadedFile(file));
    toast.success(`${files.length} file(s) added`);
  };

  const handleNext = () => {
    if (state.uploadedFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    // Generate mock extracted data for each file
    state.uploadedFiles.forEach(file => {
      const extractedData = generateMockExtractedData(file.fileCategory);
      updateFileExtractedData(file.id, extractedData);
    });

    navigate('/upload/preview/0');
  };

  const handleClose = () => {
    navigate('/upload');
  };

  if (!state.currentPatient) {
    navigate('/home');
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-card rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="vmtb-card p-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Uploaded Files ({state.uploadedFiles.length})
          </h2>

          {/* File List */}
          <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
            {state.uploadedFiles.map(file => (
              <FileCard
                key={file.id}
                file={file}
                onCategoryChange={category => updateFileCategory(file.id, category)}
                onRemove={() => removeUploadedFile(file.id)}
              />
            ))}
          </div>

          {/* Add More Files */}
          {state.uploadedFiles.length > 0 && (
            <div className="mb-8">
              <FileUploadDropzone onFilesAdded={handleFilesAdded} />
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={state.uploadedFiles.length === 0}
              className="vmtb-btn-primary px-8"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadReview;
