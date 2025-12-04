import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import ZoomablePreview from '@/components/ZoomablePreview';
import { useApp } from '@/contexts/AppContext';

/**
 * FilePreview page with two-panel layout:
 * - Left: Zoomable/pannable document preview
 * - Right: Single large JSON textarea for extracted data
 * 
 * Edits are saved when navigating between files.
 * Scrollbars hidden on preview pane.
 */
const FilePreview = () => {
  const { fileIndex } = useParams();
  const navigate = useNavigate();
  const { state, updateFileExtractedData } = useApp();
  const [jsonText, setJsonText] = useState('');

  const currentIndex = parseInt(fileIndex || '0', 10);
  const currentFile = state.uploadedFiles[currentIndex];
  const totalFiles = state.uploadedFiles.length;
  const isLastFile = currentIndex === totalFiles - 1;
  const isFirstFile = currentIndex === 0;

  // Convert extracted data to JSON string for editing
  useEffect(() => {
    if (currentFile?.extractedData) {
      setJsonText(JSON.stringify(currentFile.extractedData, null, 2));
    } else {
      setJsonText('{}');
    }
  }, [currentFile]);

  const saveCurrentFile = () => {
    if (currentFile) {
      try {
        const parsed = JSON.parse(jsonText);
        updateFileExtractedData(currentFile.id, parsed);
      } catch {
        // If JSON is invalid, save as a single field
        updateFileExtractedData(currentFile.id, { content: jsonText });
      }
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
    <div className="min-h-screen bg-muted flex flex-col">
      <Header />
      
      {/* File Header */}
      <div className="bg-background border-b border-border px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{currentFile.name}</h2>
            <p className="text-sm text-muted-foreground">
              file {currentIndex + 1} out of {totalFiles}
            </p>
          </div>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {currentFile.fileCategory}
          </span>
        </div>
      </div>

      {/* Two Panel Layout - Full height minus header */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Original Document with zoom/pan */}
        <div className="w-full md:w-1/2 h-[40vh] md:h-auto border-b md:border-b-0 md:border-r border-border p-4 overflow-hidden">
          <div className="h-full rounded-lg overflow-hidden hide-scrollbar">
            <ZoomablePreview file={currentFile} />
          </div>
        </div>

        {/* Right Panel - Extracted JSON */}
        <div className="w-full md:w-1/2 flex flex-col p-4 overflow-hidden">
          <div className="flex-shrink-0 mb-4">
            <h3 className="text-lg font-semibold text-foreground">Digitized JSON</h3>
            <p className="text-sm text-muted-foreground">
              Review and edit the extracted information. Changes are saved when navigating.
            </p>
          </div>

          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            className="flex-1 vmtb-input font-mono text-sm resize-none min-h-[200px]"
            placeholder="Extracted JSON data..."
            spellCheck={false}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4 pt-4 border-t border-border flex-shrink-0">
            <button
              onClick={handlePrevious}
              disabled={isFirstFile}
              className="vmtb-btn-outline flex items-center gap-2 disabled:opacity-50"
              aria-label="Previous file"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            <button 
              onClick={handleNext} 
              className="vmtb-btn-primary flex items-center gap-2"
              aria-label={isLastFile ? 'Submit' : 'Next file'}
            >
              {isLastFile ? 'Submit' : 'Next'}
              {!isLastFile && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FilePreview;