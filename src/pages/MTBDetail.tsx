import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import CaseTable from '@/components/CaseTable';
import ExpertList from '@/components/ExpertList';
import AddExpertModal from '@/components/AddExpertModal';
import { useApp } from '@/contexts/AppContext';

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
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('mycases');
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
          <div className="p-4 md:p-6 animate-fade-in flex flex-col h-[calc(100vh-10rem)]">
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto hide-scrollbar">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-medium text-foreground">Experts</h3>
                  {/* Add Expert button for owners */}
                  {isOwner && (
                    <button
                      onClick={() => setShowAddExpert(true)}
                      className="px-2 py-1 vmtb-btn-primary flex items-center gap-1 text-xs whitespace-nowrap"
                      aria-label="Add expert"
                    >
                      <Plus className="w-3 h-3" />
                      Add Expert
                    </button>
                  )}
                </div>
                <ExpertList
                  experts={displayExperts}
                  selectedExpert={null}
                  onSelectExpert={() => {}}
                />
              </div>
            </div>

            {/* Disclaimer for non-owners - Fixed at bottom */}
            {!isOwner && (
              <div className="mt-4 pt-4 border-t border-border" role="note">
                <p className="text-xs text-muted-foreground">
                  To add experts to this MTB, please contact the MTB creator.
                </p>
              </div>
            )}
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