import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import ZoomablePreview from '@/components/ZoomablePreview';
import ConfirmModal from '@/components/ConfirmModal';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * FilePreview page with redesigned compact header:
 * - Left: Previous button
 * - Center: File name, dropdown for file selection, file type tag
 * - Right: Next/Submit button
 * - Two-panel layout with fixed height image container
 */
const FilePreview = () => {
  const { fileIndex } = useParams();
  const navigate = useNavigate();
  const { state, updateFileExtractedData, createCase } = useApp();
  const [jsonText, setJsonText] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentIndex = parseInt(fileIndex || '0', 10);
  const currentFile = state.uploadedFiles[currentIndex];
  const totalFiles = state.uploadedFiles.length;
  const isLastFile = currentIndex === totalFiles - 1;
  const isFirstFile = currentIndex === 0;

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
        updateFileExtractedData(currentFile.id, { content: jsonText });
      }
    }
  };

  const handleNext = () => {
    saveCurrentFile();
    
    if (isLastFile) {
      setShowSubmitModal(true);
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

  const handleFileSelect = (index: number) => {
    saveCurrentFile();
    navigate(`/upload/preview/${index}`);
  };

  const handleCreateCase = () => {
    const newCase = createCase();
    if (newCase) {
      toast.success('Case created successfully!');
      setShowSubmitModal(false);
      navigate(`/cases/${newCase.id}`);
    } else {
      toast.error('Failed to create case');
    }
  };

  const handleGoBack = () => {
    setShowSubmitModal(false);
  };

  if (!state.currentPatient || !currentFile) {
    navigate('/home');
    return null;
  }

  return (
    <div className="h-screen bg-muted flex flex-col overflow-hidden overscroll-y-none">
      <Header />
      
      {/* Compact Single-Row File Navigation Header */}
      <div className="bg-background border-b border-border px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back to Upload Button */}
          <button
            onClick={() => navigate('/upload/review')}
            className="vmtb-btn-outline flex items-center gap-1 px-2.5 py-1 text-xs flex-shrink-0"
            aria-label="Back to uploads"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Upload
          </button>

          {/* Center: File Name with Dropdown */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary truncate max-w-[180px] md:max-w-[280px]">
                  {currentFile.name}
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="max-h-60 overflow-y-auto">
                {state.uploadedFiles.map((file, index) => (
                  <DropdownMenuItem
                    key={file.id}
                    onClick={() => handleFileSelect(index)}
                    className={index === currentIndex ? 'bg-primary/10' : ''}
                  >
                    <span className={file.name.length > 100 ? 'truncate max-w-[200px]' : ''}>{file.name.length > 100 ? file.name.substring(0, 97) + '...' : file.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* File Type Tag */}
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex-shrink-0">
              {currentFile.fileCategory}
            </span>
          </div>

          {/* Right: Previous and Next/Submit Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={isFirstFile}
              className="vmtb-btn-outline flex items-center gap-1 px-2.5 py-1 text-xs disabled:opacity-50 flex-shrink-0"
              aria-label="Previous file"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button 
              onClick={handleNext} 
              className="vmtb-btn-primary flex items-center gap-1 px-2.5 py-1 text-xs flex-shrink-0"
              aria-label={isLastFile ? 'Submit' : 'Next file'}
            >
              {isLastFile ? 'Submit' : 'Next'}
              {!isLastFile && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Two Panel Layout - fills remaining height */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left Panel - Document Preview with fixed height container */}
        <div className="w-full md:w-1/2 h-[40vh] md:h-full border-b md:border-b-0 md:border-r border-border p-3 overflow-hidden">
          <div className="h-full rounded-lg overflow-auto hide-scrollbar">
            <ZoomablePreview file={currentFile} />
          </div>
        </div>

        {/* Right Panel - JSON Editor Only */}
        <div className="w-full md:w-1/2 flex flex-col p-3 overflow-hidden flex-1 md:flex-initial md:h-full">
          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            className="flex-1 vmtb-input font-mono text-sm resize-none min-h-[150px]"
            placeholder="Extracted JSON data..."
            spellCheck={false}
          />
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      <ConfirmModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        title="Create Case"
        description="Are you ready to create this case? If you need to make changes, you can go back. Patient report and presentation will be generated automatically and are available from the Patient Profile."
        confirmLabel="Create Case"
        cancelLabel="Go Back"
        onConfirm={handleCreateCase}
        onCancel={handleGoBack}
      />
    </div>
  );
};

export default FilePreview;
