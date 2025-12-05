import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, User } from 'lucide-react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import CaseTable from '@/components/CaseTable';
import ExpertList from '@/components/ExpertList';
import AddExpertModal from '@/components/AddExpertModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useApp } from '@/contexts/AppContext';

const tabs = [
  { id: 'mycases', label: 'My Cases' },
  { id: 'shared', label: 'Shared Cases' },
  { id: 'experts', label: 'Experts' },
];

/**
 * MTBDetail page with owner/enrolled behaviors:
 * - Owner: Can see Add Expert button and remove experts
 * - Enrolled: Shows polite disclaimer instead
 * - Experts tab: Group chat default, private chat on expert selection
 * - Full-width layout with MTB DP in header
 */
const MTBDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, removeExpertFromMTB, sendInvitations } = useApp();
  const [activeTab, setActiveTab] = useState('mycases');
  const [showAddExpert, setShowAddExpert] = useState(false);
  const [expertToRemove, setExpertToRemove] = useState<string | null>(null);
  const [removeExpertModalOpen, setRemoveExpertModalOpen] = useState(false);

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
    // Send invitation to the expert
    if (sendInvitations) {
      sendInvitations(mtb.id, mtb.name, [email]);
    }
    console.log('Adding expert:', { name, email, specialty });
  };

  const handleRemoveExpertClick = (expertId: string) => {
    setExpertToRemove(expertId);
    setRemoveExpertModalOpen(true);
  };

  const handleConfirmRemoveExpert = () => {
    if (expertToRemove && removeExpertFromMTB) {
      removeExpertFromMTB(mtb.id, expertToRemove);
    }
    setRemoveExpertModalOpen(false);
    setExpertToRemove(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mycases':
        return (
          <div className="p-4 md:p-6 animate-fade-in">
            <CaseTable 
              cases={myCases} 
              title="My Cases" 
              basePath={`/mtbs/${id}/cases`}
              showActions="all"
            />
          </div>
        );

      case 'shared':
        return (
          <div className="p-4 md:p-6 animate-fade-in">
            <CaseTable 
              cases={sharedCases} 
              title="Shared Cases" 
              basePath={`/mtbs/${id}/cases`}
              showActions="view-only"
            />
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
                
                {/* Expert list with remove option for owners */}
                <div className="space-y-2">
                  {displayExperts.map(expert => (
                    <div 
                      key={expert.id}
                      className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {expert.avatar ? (
                            <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{expert.name}</p>
                          <p className="text-xs text-muted-foreground">{expert.specialty}</p>
                        </div>
                      </div>
                      
                      {/* Remove button for owners only */}
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveExpertClick(expert.id)}
                          className="p-1.5 hover:bg-destructive/10 text-destructive rounded-full transition-colors"
                          title="Remove expert"
                          aria-label="Remove expert"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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
            <div className="flex items-center gap-4">
              {/* MTB Display Picture */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
                {mtb.dpImage ? (
                  <img src={mtb.dpImage} alt={mtb.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary/60" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{mtb.name}</h1>
                <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
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

      {/* Remove Expert Confirmation Modal */}
      <ConfirmModal
        open={removeExpertModalOpen}
        onOpenChange={setRemoveExpertModalOpen}
        title="Remove Expert"
        description="Are you sure you want to remove this expert from the MTB?"
        confirmLabel="Remove"
        onConfirm={handleConfirmRemoveExpert}
        destructive
      />
    </div>
  );
};

export default MTBDetail;
