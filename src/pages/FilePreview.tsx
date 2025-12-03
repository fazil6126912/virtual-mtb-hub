import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import PreviewPane from '@/components/PreviewPane';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const FilePreview = () => {
  const { fileIndex } = useParams();
  const navigate = useNavigate();
  const { state, updateFileExtractedData } = useApp();
  const [editedData, setEditedData] = useState<Record<string, string>>({});

  const currentIndex = parseInt(fileIndex || '0', 10);
  const currentFile = state.uploadedFiles[currentIndex];
  const totalFiles = state.uploadedFiles.length;
  const isLastFile = currentIndex === totalFiles - 1;

  useEffect(() => {
    if (currentFile?.extractedData) {
      setEditedData(currentFile.extractedData);
    }
  }, [currentFile]);

  const handleFieldChange = (key: string, value: string) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const saveCurrentFile = () => {
    if (currentFile) {
      updateFileExtractedData(currentFile.id, editedData);
    }
  };

  const handleNext = () => {
    saveCurrentFile();
    
    if (isLastFile) {
      navigate('/case-summary');
    } else {
      navigate(`/upload/preview/${currentIndex + 1}`);
    }
  };

  const handlePrevious = () => {
    saveCurrentFile();
    if (currentIndex > 0) {
      navigate(`/upload/preview/${currentIndex - 1}`);
    }
  };

  if (!state.currentPatient || !currentFile) {
    navigate('/home');
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      
      <main className="h-[calc(100vh-4rem)]">
        {/* File Header */}
        <div className="bg-background border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">{currentFile.name}</h2>
          <p className="text-sm text-muted-foreground">
            file {currentIndex + 1} out of {totalFiles}
          </p>
        </div>

        {/* Two Panel Layout */}
        <div className="flex h-[calc(100%-5rem)]">
          {/* Left Panel - Original Document */}
          <div className="w-1/2 border-r border-border p-6">
            <div className="h-full">
              <PreviewPane file={currentFile} />
            </div>
          </div>

          {/* Right Panel - Extracted Data */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground mb-4">Extracted Data</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Review and edit the extracted information from this document.
            </p>

            <div className="space-y-4">
              {Object.entries(editedData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {key}
                  </label>
                  <textarea
                    value={value}
                    onChange={e => handleFieldChange(key, e.target.value)}
                    className="vmtb-input min-h-[80px] resize-y"
                    rows={2}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-border">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="vmtb-btn-outline disabled:opacity-50"
              >
                Previous
              </button>
              <button onClick={handleNext} className="vmtb-btn-primary">
                {isLastFile ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FilePreview;
