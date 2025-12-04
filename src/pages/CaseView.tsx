import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Image, FileText } from 'lucide-react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import ZoomablePreview from '@/components/ZoomablePreview';
import ExpertList from '@/components/ExpertList';
import ChatBox from '@/components/ChatBox';
import GroupChat from '@/components/GroupChat';
import ResponsiveDrawer from '@/components/ResponsiveDrawer';
import { useApp } from '@/contexts/AppContext';
import { Expert, UploadedFile } from '@/lib/storage';

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'reports', label: 'Reports' },
  { id: 'experts', label: 'Experts' },
  { id: 'treatment', label: 'Treatment Plan' },
];

/**
 * CaseView page with updated layout:
 * - Profile: Shows only Name, Age, Sex, Cancer Type (no clinical summary)
 * - Reports: Left list, right image + JSON (split or toggled on mobile)
 * - Experts: Group chat default, private chat when expert selected
 * - Full-width layout throughout
 */
const CaseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, sendGroupMessage } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedReport, setSelectedReport] = useState<UploadedFile | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [chatMode, setChatMode] = useState<'group' | 'private'>('group');
  const [mobileReportView, setMobileReportView] = useState<'image' | 'json'>('image');

  const caseData = state.cases.find(c => c.id === id);

  if (!caseData) {
    navigate('/cases');
    return null;
  }

  // Get group chat messages
  const groupChatKey = `${caseData.id}-group`;
  const groupMessages = state.chats[groupChatKey] || [];

  const handleSelectExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setChatMode('private');
  };

  const handleSwitchToGroup = () => {
    setSelectedExpert(null);
    setChatMode('group');
  };

  const handleSendGroupMessage = (content: string) => {
    sendGroupMessage(caseData.id, content);
  };

  // Get JSON for selected report
  const getReportJson = () => {
    if (!selectedReport?.extractedData) return '{}';
    return JSON.stringify(selectedReport.extractedData, null, 2);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        // Profile shows ONLY Name, Age, Sex, Cancer Type - no clinical summary
        return (
          <div className="p-4 md:p-6 animate-fade-in">
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
            </div>
          </div>
        );

      case 'reports':
        // Two-column layout: Left list, Right preview + JSON
        return (
          <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] animate-fade-in">
            {/* Reports List - narrow, sticky */}
            <div className="w-full md:w-48 lg:w-56 border-b md:border-b-0 md:border-r border-border p-3 overflow-y-auto hide-scrollbar flex-shrink-0">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Reports</h3>
              {caseData.files.map((file, index) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedReport(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-2 text-sm ${
                    selectedReport?.id === file.id
                      ? 'bg-primary/10 text-foreground border border-primary/30'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  Report {index + 1}
                  <span className="block text-xs text-muted-foreground truncate">{file.name}</span>
                </button>
              ))}
            </div>

            {/* Preview + JSON Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Mobile Toggle */}
              <div className="md:hidden flex border-b border-border">
                <button
                  onClick={() => setMobileReportView('image')}
                  className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
                    mobileReportView === 'image' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => setMobileReportView('json')}
                  className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
                    mobileReportView === 'json' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  JSON
                </button>
              </div>

              {/* Image Preview */}
              <div className={`flex-1 p-4 overflow-hidden ${mobileReportView !== 'image' ? 'hidden md:block' : ''}`}>
                <div className="h-full border border-border rounded-lg overflow-hidden hide-scrollbar">
                  <ZoomablePreview file={selectedReport} />
                </div>
              </div>

              {/* JSON Panel */}
              <div className={`flex-1 p-4 border-t md:border-t-0 md:border-l border-border overflow-hidden ${mobileReportView !== 'json' ? 'hidden md:block' : ''}`}>
                <h3 className="text-sm font-medium text-foreground mb-2">Digitized JSON</h3>
                <textarea
                  value={getReportJson()}
                  readOnly
                  className="w-full h-[calc(100%-2rem)] vmtb-input font-mono text-sm resize-none"
                  placeholder="Select a report to view extracted data..."
                />
              </div>
            </div>
          </div>
        );

      case 'experts':
        // Group chat default, private chat when expert selected
        return (
          <div className="flex h-[calc(100vh-12rem)] animate-fade-in">
            {/* Experts List - Desktop */}
            <div className="hidden md:block w-64 lg:w-72 border-r border-border overflow-y-auto hide-scrollbar">
              <div className="p-4">
                {/* Chat mode toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleSwitchToGroup}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                      chatMode === 'group' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                    aria-label="Switch to Group Chat"
                  >
                    Group Chat
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                      chatMode === 'private' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                    aria-label="Private Chat mode"
                  >
                    Private
                  </button>
                </div>
                <ExpertList
                  experts={state.experts}
                  selectedExpert={selectedExpert}
                  onSelectExpert={handleSelectExpert}
                />
                {/* Disclaimer for non-owners */}
                <p className="text-xs text-muted-foreground mt-4 italic">
                  If you would like to add an expert to this MTB, please contact the case originator who created the MTB.
                </p>
              </div>
            </div>

            {/* Mobile Drawer */}
            <ResponsiveDrawer title="Experts">
              <div className="p-4">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleSwitchToGroup}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                      chatMode === 'group' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Group
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                      chatMode === 'private' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Private
                  </button>
                </div>
                <ExpertList
                  experts={state.experts}
                  selectedExpert={selectedExpert}
                  onSelectExpert={handleSelectExpert}
                />
              </div>
            </ResponsiveDrawer>

            {/* Chat Area */}
            <div className="flex-1">
              {chatMode === 'group' ? (
                <GroupChat
                  caseId={caseData.id}
                  messages={groupMessages}
                  onSendMessage={handleSendGroupMessage}
                />
              ) : selectedExpert ? (
                <ChatBox expert={selectedExpert} caseId={caseData.id} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select an expert to start a private chat
                </div>
              )}
            </div>
          </div>
        );

      case 'treatment':
        return (
          <div className="p-4 md:p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-6">Treatment Plan</h2>
            <div className="vmtb-card p-6">
              <p className="text-muted-foreground mb-4">
                Treatment plan will be added after expert consultation.
              </p>
              <textarea
                placeholder="Enter treatment plan notes..."
                className="vmtb-input min-h-[200px]"
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
        <div className="w-full px-4">
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

      <main className="w-full">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default CaseView;