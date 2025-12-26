import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { useSupabaseData, FullCase } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';
import { ChevronDown, ArrowLeft, Loader2 } from 'lucide-react';
import CancerTypeSelect from '@/components/CancerTypeSelect';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * EditCase page - Used specifically for editing existing cases.
 * This is a copy of the patient details form (Home) but configured for edit mode.
 * Pre-fills all patient data and allows modification before proceeding to document handling.
 */
const EditCase = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  
  const { state, setupEditMode } = useApp();
  const { loadCaseForEditing, checkCaseNameExists } = useSupabaseData();
  
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [cancerType, setCancerType] = useState('');
  const [caseName, setCaseName] = useState('');
  const [originalCaseName, setOriginalCaseName] = useState('');
  
  // Store loaded case data for setting up edit mode on submit
  const [loadedCase, setLoadedCase] = useState<FullCase | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Memoized load function to prevent re-renders
  const loadCase = useCallback(async () => {
    if (!caseId) {
      setLoadError('No case ID provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const caseData = await loadCaseForEditing(caseId);
      
      if (!caseData) {
        setLoadError('Case not found or you do not have permission to edit it');
        setIsLoading(false);
        return;
      }

      // Store the full case data for later use
      setLoadedCase(caseData);

      // Pre-fill form with existing patient data
      setName(caseData.patient.name || '');
      setAge(caseData.patient.age || '');
      setSex(caseData.patient.sex || '');
      setCancerType(caseData.patient.cancerType || '');
      setCaseName(caseData.caseName || '');
      setOriginalCaseName(caseData.caseName || '');
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading case for editing:', error);
      setLoadError('Failed to load case data');
      setIsLoading(false);
    }
  }, [caseId, loadCaseForEditing]);

  // Load case data on mount
  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !age || !sex || !cancerType || !caseName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!loadedCase || !caseId) {
      toast.error('Case data not loaded');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if case name changed and if new name already exists
      if (caseName.trim() !== originalCaseName) {
        const caseNameExists = await checkCaseNameExists(caseName.trim());
        if (caseNameExists) {
          toast.error('You already have a case with this name. Please choose a different name.');
          return;
        }
      }

      // Set up edit mode in AppContext with updated patient data and existing files
      const updatedPatient = { 
        name, 
        age, 
        sex, 
        cancerType, 
        caseName: caseName.trim() 
      };
      
      setupEditMode(caseId, updatedPatient, loadedCase.files);
      
      // Navigate to upload review to show existing files and allow modifications
      navigate('/upload/review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/cases');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-home-page relative">
        <Header />
        <main className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          <div className="vmtb-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-home-page relative">
        <Header />
        <main className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          <div className="vmtb-card p-8 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-4">Unable to Load Case</h2>
            <p className="text-muted-foreground mb-6">{loadError}</p>
            <button
              onClick={handleBack}
              className="vmtb-btn-primary px-6 py-2"
            >
              Back to Cases
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-home-page relative">
      <Header />
      
      <main className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
        <form onSubmit={handleSubmit}>
          <div className="home-form-card">
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                type="button"
                onClick={handleBack}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h1 className="text-xl font-semibold text-foreground">Edit Case</h1>
            </div>

            <p className="text-muted-foreground mb-6">
              Update the patient details below. After saving, you can review and modify the uploaded documents.
            </p>

            {/* Name Field */}
            <div className="home-form-field">
              <label className="home-form-label">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="home-form-input"
                placeholder="Patient name"
              />
              <p className="home-form-helper">
                This patient name will remain anonymized and will not be shared with any MTB.
              </p>
            </div>

            {/* Age Field */}
            <div className="home-form-field">
              <label className="home-form-label">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="home-form-input"
                placeholder="Patient age"
                min="0"
                max="150"
              />
            </div>

            {/* Sex Field - Themed dropdown */}
            <div className="home-form-field">
              <label className="home-form-label">Sex</label>
              <div className="relative w-full">
                <select
                  value={sex}
                  onChange={e => setSex(e.target.value)}
                  className="home-form-input w-full appearance-none pr-10 cursor-pointer"
                >
                  <option value="">Select sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Cancer Type Field - Searchable dropdown */}
            <div className="home-form-field">
              <label className="home-form-label">Cancer Type</label>
              <CancerTypeSelect
                value={cancerType}
                onChange={setCancerType}
                placeholder="Search and select cancer type"
              />
            </div>

            {/* Case Name Field */}
            <div className="home-form-field">
              <label className="home-form-label">Case Name</label>
              <input
                type="text"
                value={caseName}
                onChange={e => setCaseName(e.target.value)}
                className="home-form-input"
                placeholder="Enter a unique case name"
              />
              <p className="home-form-helper">
                When you share this case with any MTB, the case will be referenced using this name.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="vmtb-btn-outline flex-1 py-3"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="home-btn-next flex-1 flex items-center justify-center gap-2" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditCase;
