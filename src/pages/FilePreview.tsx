import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, CheckCircle } from 'lucide-react';
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

interface FileProgress {
  id: string;
  name: string;
  visited: boolean;
}

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
  const { state, updateFileExtractedData, createCase, modifyCase } = useApp();
  const isEditMode = state.isEditMode;
  const [jsonText, setJsonText] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedFileIds, setEditedFileIds] = useState<Set<string>>(new Set());
  const [progressList, setProgressList] = useState<FileProgress[]>(() => {
    if (isEditMode) {
      // In edit mode, mark original files as visited, new files as not visited
      return state.uploadedFiles.map(file => ({
        id: file.id,
        name: file.name,
        visited: state.originalFiles.some(orig => orig.id === file.id) && !editedFileIds.has(file.id),
      }));
    }
    return state.uploadedFiles.map(file => ({ id: file.id, name: file.name, visited: false }));
  });
  const [showUnvisitedModal, setShowUnvisitedModal] = useState(false);
  const [triggerShake, setTriggerShake] = useState(false);

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

  // Show loading state when file changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 second loader

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Mark current document as visited when landing on it (unless edit mode and original file)
  useEffect(() => {
    if (isEditMode && state.originalFiles.some(f => f.id === currentFile?.id)) {
      // Don't require re-visit for unchanged original files
      return;
    }
    setProgressList(prev =>
      prev.map(p => p.id === currentFile?.id ? { ...p, visited: true } : p)
    );
  }, [currentIndex, currentFile?.id, isEditMode]);

  const allDocsVisited = progressList.every(p => p.visited);
  const unvisitedDocs = progressList.filter(p => !p.visited);

  const saveCurrentFile = () => {
    if (currentFile) {
      // Check if extracted data has changed (for edit mode)
      const originalFile = state.originalFiles.find(f => f.id === currentFile.id);
      const originalData = originalFile?.extractedData ? JSON.stringify(originalFile.extractedData) : '{}';
      const newData = jsonText;
      
      try {
        const parsed = JSON.parse(newData);
        updateFileExtractedData(currentFile.id, parsed);
        
        // Mark as edited if data changed and in edit mode
        if (isEditMode && newData !== originalData) {
          setEditedFileIds(prev => new Set([...prev, currentFile.id]));
        }
      } catch {
        updateFileExtractedData(currentFile.id, { content: newData });
        
        // Mark as edited if content changed and in edit mode
        if (isEditMode && originalData !== `{"content":"${newData}"}`) {
          setEditedFileIds(prev => new Set([...prev, currentFile.id]));
        }
      }
    }
  };

  const handleNext = () => {
    saveCurrentFile();
    
    if (isLastFile) {
      // In edit mode, skip all-files-visited check
      if (!isEditMode && !allDocsVisited) {
        setTriggerShake(true);
        setTimeout(() => setTriggerShake(false), 500);
        setShowUnvisitedModal(true);
        return;
      }
      if (isEditMode) {
        setShowModifyModal(true);
      } else {
        setShowSubmitModal(true);
      }
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

  const handleModifyCase = () => {
    saveCurrentFile();
    
    // Check which files are incomplete
    const incompleteFiles = progressList.filter(p => !p.visited).map(p => p.name);
    
    if (incompleteFiles.length > 0) {
      // Trigger earthquake and show incomplete files modal
      setTriggerShake(true);
      setTimeout(() => setTriggerShake(false), 500);
      setShowIncompleteModal(true);
      return;
    }
    
    // All files complete, proceed with modification
    if (modifyCase()) {
      toast.success('Case updated successfully!');
      setShowModifyModal(false);
      // Navigate to the case view page
      if (state.editingCaseId) {
        navigate(`/cases/${state.editingCaseId}`);
      }
    } else {
      toast.error('Failed to update case');
    }
  };

  const handleGoBackFromModify = () => {
    setShowModifyModal(false);
  };

  const handleGoBackFromIncomplete = () => {
    setShowIncompleteModal(false);
    const incompleteFiles = progressList.filter(p => !p.visited);
    if (incompleteFiles.length > 0) {
      const firstIncomplete = incompleteFiles[0];
      const index = state.uploadedFiles.findIndex(f => f.id === firstIncomplete.id);
      if (index >= 0) {
        navigate(`/upload/preview/${index}`);
      }
    }
  };

  const handleGoBackToIncomplete = () => {
    setShowUnvisitedModal(false);
    const firstUnvisited = unvisitedDocs[0];
    if (firstUnvisited) {
      const index = state.uploadedFiles.findIndex(f => f.id === firstUnvisited.id);
      if (index >= 0) {
        navigate(`/upload/preview/${index}`);
      }
    }
  };

  if (!state.currentPatient || !currentFile) {
    navigate('/home');
    return null;
  }

  return (
    <div className={`h-screen bg-muted flex flex-col overflow-hidden overscroll-y-none ${triggerShake ? 'shake' : ''}`}>
      <Header />
      
      {/* Compact Single-Row File Navigation Header */}
      <div className="bg-background border-b border-border px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back to Anonymize Button */}
          <button
            onClick={() => navigate(`/upload/anonymize/${currentIndex}`)}
            className="vmtb-btn-outline flex items-center gap-1 px-2.5 py-1 text-xs flex-shrink-0"
            aria-label="Back to anonymize"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Anonymize
          </button>

          {/* Center: File Name with Dropdown */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary truncate max-w-[180px] md:max-w-[280px]">
                  <span className="truncate">{currentFile.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="max-h-60 overflow-y-auto">
                {state.uploadedFiles.map((file, index) => {
                  const fileProgress = progressList.find(p => p.id === file.id);
                  return (
                    <DropdownMenuItem
                      key={file.id}
                      onClick={() => handleFileSelect(index)}
                      className={index === currentIndex ? 'bg-primary/10' : ''}
                    >
                      <div className="flex items-center justify-between gap-3 w-full group">
                        <span className={file.name.length > 100 ? 'truncate max-w-[200px]' : ''}>{file.name.length > 100 ? file.name.substring(0, 97) + '...' : file.name}</span>
                        {fileProgress?.visited && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 group-hover:text-white transition-colors" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
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
              aria-label={isLastFile ? (isEditMode ? 'Modify case' : 'Create case') : 'Next file'}
            >
              {isLastFile ? (isEditMode ? 'Modify Case' : 'Create Case') : 'Next'}
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

        {/* Right Panel - JSON Editor or Loader */}
        <div className="w-full md:w-1/2 flex flex-col p-3 overflow-hidden flex-1 md:flex-initial md:h-full">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <div className="mb-4 flex justify-center">
                <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-sm font-medium">Processing, please wait…</p>
            </div>
          ) : (
            <textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              className="flex-1 vmtb-input font-mono text-sm resize-none min-h-[150px]"
              placeholder="Extracted JSON data..."
              spellCheck={false}
            />
          )}
        </div>
      </main>

      {/* Unvisited Documents Warning Modal */}
      <ConfirmModal
        open={showUnvisitedModal}
        onOpenChange={setShowUnvisitedModal}
        title="Some documents are incomplete"
        description={`Please complete all documents before proceeding. The following documents are not completed: ${unvisitedDocs.map(d => d.name).join(', ')}`}
        confirmLabel="Go Back & Complete"
        cancelLabel=""
        onConfirm={handleGoBackToIncomplete}
        onCancel={() => setShowUnvisitedModal(false)}
      />

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

      {/* Modify Case Confirmation Modal */}
      <ConfirmModal
        open={showModifyModal}
        onOpenChange={setShowModifyModal}
        title="Modify Case"
        description="Are you ready to save these changes to the case? All edits will be permanently updated."
        confirmLabel="Modify Case"
        cancelLabel="Go Back"
        onConfirm={handleModifyCase}
        onCancel={handleGoBackFromModify}
      />

      {/* Incomplete Files Warning Modal (Edit Mode) */}
      <ConfirmModal
        open={showIncompleteModal}
        onOpenChange={setShowIncompleteModal}
        title="Some documents are incomplete"
        description={`Please complete all documents before modifying the case. The following documents are not completed: ${progressList.filter(p => !p.visited).map(p => p.name).join(', ')}`}
        confirmLabel="Go Back & Complete"
        cancelLabel=""
        onConfirm={handleGoBackFromIncomplete}
        onCancel={() => setShowIncompleteModal(false)}
      />
    </div>
  );
};

export default FilePreview;
