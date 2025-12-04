import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import CaseTable from '@/components/CaseTable';
import ExpertList from '@/components/ExpertList';
import GroupChat from '@/components/GroupChat';
import ChatBox from '@/components/ChatBox';
import ResponsiveDrawer from '@/components/ResponsiveDrawer';
import AddExpertModal from '@/components/AddExpertModal';
import { useApp } from '@/contexts/AppContext';
import { Expert, generateId } from '@/lib/storage';

const tabs = [
  { id: 'mycases', label: 'My Cases' },
  { id: 'shared', label: 'Shared Cases' },
  { id: 'experts', label: 'Experts' },
];

/**
 * MTBDetail page with owner/enrolled behaviors:
 * - Owner: Can see Add Expert button
 * - Enrolled: Shows polite disclaimer instead
 * - Experts tab: Group chat default, private chat on expert selection
 * - Full-width layout
 */
const MTBDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, sendGroupMessage } = useApp();
  const [activeTab, setActiveTab] = useState('mycases');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [chatMode, setChatMode] = useState<'group' | 'private'>('group');
  const [showAddExpert, setShowAddExpert] = useState(false);

  const mtb = state.mtbs.find(m => m.id === id);

  if (!mtb) {
    navigate('/mtbs');
    return null;
  }

  // Check if current user is owner
  const isOwner = mtb.isOwner;

  // Get cases associated with this MTB
  const myCases = state.cases;
  const sharedCases = state.cases.slice(0, 2);

  // Get experts for this MTB
  const mtbExperts = state.experts.filter(e => mtb.experts.includes(e.id));
  const displayExperts = mtbExperts.length > 0 ? mtbExperts : state.experts;

  // Group chat for MTB
  const groupChatKey = `mtb-${mtb.id}-group`;
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
    sendGroupMessage(`mtb-${mtb.id}`, content);
  };

  const handleAddExpert = (name: string, email: string, specialty: string) => {
    // In a real app, this would send an invitation
    // For now, just show success toast
    console.log('Adding expert:', { name, email, specialty });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mycases':
        return (
          <div className="p-4 md:p-6 animate-fade-in">
            <CaseTable cases={myCases} title="My Cases" basePath={`/mtbs/${id}/cases`} />
          </div>
        );

      case 'shared':
        return (
          <div className="p-4 md:p-6 animate-fade-in">
            <CaseTable cases={sharedCases} title="Shared Cases" basePath={`/mtbs/${id}/cases`} />
          </div>
        );

      case 'experts':
        return (
          <div className="flex h-[calc(100vh-12rem)] animate-fade-in">
            {/* Experts List - Desktop */}
            <div className="hidden md:block w-64 lg:w-72 border-r border-border overflow-y-auto hide-scrollbar">
              <div className="p-4">
                {/* Add Expert button for owners */}
                {isOwner && (
                  <button
                    onClick={() => setShowAddExpert(true)}
                    className="w-full vmtb-btn-primary flex items-center justify-center gap-2 mb-4"
                  >
                    <Plus className="w-4 h-4" />
                    Add Expert
                  </button>
                )}

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

                <h3 className="text-sm font-medium text-foreground mb-3">Board Experts</h3>
                <ExpertList
                  experts={displayExperts}
                  selectedExpert={selectedExpert}
                  onSelectExpert={handleSelectExpert}
                />

                {/* Disclaimer based on ownership */}
                <div className="mt-4 pt-4 border-t border-border">
                  {isOwner ? (
                    <p className="text-xs text-muted-foreground italic">
                      As the MTB creator, you may add experts using the "Add Expert" button above.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      If you would like to add an expert to this MTB, please contact the case originator who created the MTB.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Drawer */}
            <ResponsiveDrawer title="Experts">
              <div className="p-4">
                {isOwner && (
                  <button
                    onClick={() => setShowAddExpert(true)}
                    className="w-full vmtb-btn-primary flex items-center justify-center gap-2 mb-4"
                  >
                    <Plus className="w-4 h-4" />
                    Add Expert
                  </button>
                )}
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
                  experts={displayExperts}
                  selectedExpert={selectedExpert}
                  onSelectExpert={handleSelectExpert}
                />
                {!isOwner && (
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Contact the MTB creator to add experts.
                  </p>
                )}
              </div>
            </ResponsiveDrawer>

            {/* Chat Area */}
            <div className="flex-1">
              {chatMode === 'group' ? (
                <GroupChat
                  caseId={`mtb-${mtb.id}`}
                  messages={groupMessages}
                  onSendMessage={handleSendGroupMessage}
                />
              ) : selectedExpert ? (
                <ChatBox expert={selectedExpert} caseId={`mtb-${mtb.id}`} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select an expert to start a private chat
                </div>
              )}
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
            <div>
              <h1 className="text-lg font-semibold text-foreground">{mtb.name}</h1>
              <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <button
              onClick={() => navigate('/mtbs')}
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

      {/* Add Expert Modal */}
      <AddExpertModal
        open={showAddExpert}
        onOpenChange={setShowAddExpert}
        onAdd={handleAddExpert}
      />
    </div>
  );
};

export default MTBDetail;