import { useNavigate } from 'react-router-dom';
import { FileText, Presentation, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { generateId } from '@/lib/storage';
import { useState } from 'react';

const CaseSummary = () => {
  const navigate = useNavigate();
  const { state, createCase } = useApp();
  const [caseName, setCaseName] = useState('');

  if (!state.currentPatient || state.uploadedFiles.length === 0) {
    navigate('/home');
    return null;
  }

  const patient = state.currentPatient;
  const patientId = `PT-${generateId().slice(0, 8).toUpperCase()}`;

  // Generate clinical summary from extracted data
  const clinicalSummary = state.uploadedFiles
    .filter(f => f.extractedData)
    .map(f => {
      const entries = Object.entries(f.extractedData || {});
      return entries.map(([k, v]) => `${k}: ${v}`).join('\n');
    })
    .join('\n\n');

  const handleCreateReport = () => {
    toast.info('Report generation feature coming soon');
  };

  const handleCreatePresentation = () => {
    toast.info('Presentation generation feature coming soon');
  };

  const handleFinish = () => {
    if (!caseName.trim()) {
      toast.error('Case name is required');
      return;
    }

    // Check if case name already exists
    const caseNameExists = state.cases.some(
      c => c.caseName === caseName.trim() && c.ownerId === state.loggedInUser?.id
    );
    if (caseNameExists) {
      toast.error('You already have a case with this name. Case names must be unique.');
      return;
    }

    const newCase = createCase(caseName.trim(), clinicalSummary);
    if (newCase) {
      toast.success('Case created successfully!');
      navigate('/cases');
    } else {
      toast.error('Failed to create case');
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="vmtb-card p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground">Case Summary</h1>
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Case Name - Required Field */}
          <div className="bg-muted rounded-xl p-6 mb-8">
            <div className="mb-4">
              <label className="block text-lg font-semibold text-foreground mb-3">Case Name</label>
              <input
                type="text"
                value={caseName}
                onChange={e => setCaseName(e.target.value)}
                placeholder="Enter a unique case name"
                className="vmtb-input w-full mb-2"
              />
              <p className="text-xs text-muted-foreground">
                Whenever you share this case with any MTB, the case will be referenced using this name.
              </p>
            </div>
          </div>

          {/* Patient Profile */}
          <div className="bg-muted rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Patient Profile</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium text-foreground">{patient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sex</p>
                <p className="font-medium text-foreground">{patient.sex}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cancer Type</p>
                <p className="font-medium text-foreground">{patient.cancerType}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-medium text-foreground">{patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Case Created</p>
                  <p className="font-medium text-foreground">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Summary */}
          <div className="bg-muted rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Clinical Summary</h2>
            <div className="space-y-4">
              {state.uploadedFiles.map(file => (
                <div key={file.id} className="bg-background rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">
                    {file.fileCategory} - {file.name}
                  </h3>
                  {file.extractedData && (
                    <div className="space-y-1 text-sm">
                      {Object.entries(file.extractedData).map(([key, value]) => (
                        <p key={key} className="text-muted-foreground">
                          <span className="font-medium text-foreground">{key}:</span> {value}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons - All in one row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start mb-8">
            <button
              onClick={handleCreateReport}
              className="vmtb-btn-outline flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <FileText className="w-5 h-5" />
              Create Patient Report
            </button>
            <button
              onClick={handleCreatePresentation}
              className="vmtb-btn-outline flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Presentation className="w-5 h-5" />
              Create Presentation
            </button>
            <button onClick={handleFinish} className="vmtb-btn-primary px-8 flex items-center justify-center gap-2 flex-1 sm:flex-none">
              Create Case
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseSummary;
