import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import PreviewPane from '@/components/PreviewPane';
import ExpertList from '@/components/ExpertList';
import ChatBox from '@/components/ChatBox';
import { useApp } from '@/contexts/AppContext';
import { Expert, UploadedFile } from '@/lib/storage';

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'reports', label: 'Reports' },
  { id: 'experts', label: 'Experts' },
  { id: 'treatment', label: 'Treatment Plan' },
];

const CaseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedReport, setSelectedReport] = useState<UploadedFile | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  const caseData = state.cases.find(c => c.id === id);

  if (!caseData) {
    navigate('/cases');
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-6">Patient Profile</h2>
            <div className="vmtb-card p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">{caseData.patient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium text-foreground">{caseData.patient.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sex</p>
                  <p className="font-medium text-foreground">{caseData.patient.sex}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cancer Type</p>
                  <p className="font-medium text-foreground">{caseData.patient.cancerType}</p>
                </div>
              </div>

              {caseData.clinicalSummary && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-medium text-foreground mb-3">Clinical Summary</h3>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                    {caseData.clinicalSummary}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="flex h-[calc(100vh-12rem)] animate-fade-in">
            {/* Reports List */}
            <div className="w-64 border-r border-border p-4 overflow-y-auto">
              {caseData.files.map((file, index) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedReport(file)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors mb-2 ${
                    selectedReport?.id === file.id
                      ? 'bg-primary/10 text-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  Report {index + 1}
                </button>
              ))}
            </div>

            {/* Preview Area */}
            <div className="flex-1 p-6">
              <div className="h-full border border-border rounded-lg overflow-hidden">
                <PreviewPane file={selectedReport} />
              </div>
            </div>
          </div>
        );

      case 'experts':
        return (
          <div className="flex h-[calc(100vh-12rem)] animate-fade-in">
            {/* Experts List */}
            <div className="w-72 border-r border-border p-4 overflow-y-auto">
              <ExpertList
                experts={state.experts}
                selectedExpert={selectedExpert}
                onSelectExpert={setSelectedExpert}
              />
            </div>

            {/* Chat Area */}
            <div className="flex-1">
              {selectedExpert ? (
                <ChatBox expert={selectedExpert} caseId={caseData.id} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select an expert to start chatting
                </div>
              )}
            </div>
          </div>
        );

      case 'treatment':
        return (
          <div className="p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-6">Treatment Plan</h2>
            <div className="vmtb-card p-6">
              <p className="text-muted-foreground">
                Treatment plan will be added after expert consultation.
              </p>
              <textarea
                placeholder="Enter treatment plan notes..."
                className="vmtb-input mt-4 min-h-[200px]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <button
              onClick={() => navigate('/cases')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default CaseView;
