import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, User, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import CaseTable from '@/components/CaseTable';
import ExpertList from '@/components/ExpertList';
import AddExpertModal from '@/components/AddExpertModal';
import AddCaseToMTBModal from '@/components/AddCaseToMTBModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useApp } from '@/contexts/AppContext';
import { Case } from '@/lib/storage';

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
  const [showAddCase, setShowAddCase] = useState(false);
  const [expertToRemove, setExpertToRemove] = useState<string | null>(null);
  const [removeExpertModalOpen, setRemoveExpertModalOpen] = useState(false);

  // Defensive checks
  if (!id) {
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Invalid MTB ID</h2>
            <p className="text-muted-foreground mb-4">No MTB ID was provided.</p>
            <button
              onClick={() => navigate('/mtbs')}
              className="px-4 py-2 vmtb-btn-primary rounded-lg"
            >
              Back to MTBs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mtb = state.mtbs.find(m => m.id === id);

  if (!mtb) {
    console.warn(`MTB with ID "${id}" not found in state. Available MTB IDs:`, state.mtbs.map(m => m.id));
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">MTB Not Found</h2>
            <p className="text-muted-foreground mb-4">The MTB you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/mtbs')}
              className="px-4 py-2 vmtb-btn-primary rounded-lg"
            >
              Back to MTBs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if current user is owner
  const isOwner = mtb.isOwner;

  // Get cases associated with this MTB
  const myCases = state.cases.filter(c => mtb.cases.includes(c.id));
  const sharedCases = state.cases.filter(c => mtb.cases.includes(c.id)).slice(0, 2);

  // Get experts for this MTB
  const mtbExperts = state.experts.filter(e => mtb.experts.includes(e.id));
  const displayExperts = mtbExperts;

  const handleAddExpert = (name: string, email: string, specialty: string) => {
    // Send invitation to the expert
    if (sendInvitations) {
      sendInvitations(mtb.id, mtb.name, [email]);
    }
    console.log('Adding expert:', { name, email, specialty });
  };

  const handleAddCases = (caseIds: string[]) => {
    // In a real app, this would update the MTB with the new cases
    // For now, this is a placeholder for future functionality
    console.log('Adding cases to MTB:', caseIds);
    // The cases are already in state, just log for now
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
          <div className="p-4 md:p-6 animate-fade-in flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 overflow-y-auto">
              <div className="vmtb-card p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  {isOwner && (
                    <button
                      onClick={() => setShowAddCase(true)}
                      className="px-3 py-1 vmtb-btn-primary flex items-center gap-1 text-sm whitespace-nowrap"
                      aria-label="Add case to MTB"
                    >
                      <Plus className="w-4 h-4" />
                      Add Case
                    </button>
                  )}
                  <div className="flex-1"></div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {myCases.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <p>No cases have been added to this MTB yet.</p>
                      {isOwner && (
                        <p className="text-sm mt-2">Click "Add Case" to get started.</p>
                      )}
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Case Name</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Patient Name</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Patient Info</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cancer Type</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Created Date</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myCases.map(caseItem => (
                          <tr key={caseItem.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="py-4 px-4 text-foreground font-medium">{caseItem.caseName}</td>
                            <td className="py-4 px-4 text-foreground">{caseItem.patient.name}</td>
                            <td className="py-4 px-4 text-foreground">
                              {caseItem.patient.age}y, {caseItem.patient.sex.charAt(0).toUpperCase()}
                            </td>
                            <td className="py-4 px-4 text-foreground">{caseItem.patient.cancerType}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                caseItem.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {caseItem.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-foreground text-sm">{new Date(caseItem.createdDate).toLocaleDateString()}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {}}
                                  className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                  title="View case"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {}}
                                  className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                                  title="Edit case"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {}}
                                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                  title="Delete case"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'shared':
        return (
          <div className="p-4 md:p-6 animate-fade-in flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 overflow-y-auto">
              <div className="vmtb-card p-6 animate-fade-in">
                <div className="flex items-center justify-end mb-6">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {sharedCases.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <p>No cases are being shared with this MTB yet.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Case Name</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Patient Info</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cancer Type</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Created Date</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sharedCases.map(caseItem => (
                          <tr key={caseItem.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="py-4 px-4 text-foreground font-medium">{caseItem.caseName}</td>
                            <td className="py-4 px-4 text-foreground">
                              {caseItem.patient.age}y, {caseItem.patient.sex.charAt(0).toUpperCase()}
                            </td>
                            <td className="py-4 px-4 text-foreground">{caseItem.patient.cancerType}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                caseItem.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {caseItem.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-foreground text-sm">{new Date(caseItem.createdDate).toLocaleDateString()}</td>
                            <td className="py-4 px-4">
                              <button 
                                onClick={() => {}}
                                className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                title="View case"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'experts':
        return (
          <div className="p-4 md:p-6 animate-fade-in flex flex-col h-[calc(100vh-200px)]">
            <div className="flex items-center justify-between gap-3 mb-4">
              {/* Add Expert button for owners - no heading needed */}
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

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {/* Expert list with remove option for owners */}
              <div className="space-y-2 pr-2">
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
                          className="p-1.5 hover:bg-destructive/10 text-destructive rounded-full transition-colors flex-shrink-0"
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
        return (
          <div className="p-4 md:p-6 animate-fade-in flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Invalid tab selected: {activeTab}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  try {
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <Header />
        
        <div className="bg-background border-b border-border flex-shrink-0">
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
                className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-hidden w-full">
          {renderTabContent()}
        </main>

        {/* Add Expert Modal */}
        <AddExpertModal
          open={showAddExpert}
          onOpenChange={setShowAddExpert}
          onAdd={handleAddExpert}
        />

        {/* Add Case to MTB Modal */}
        <AddCaseToMTBModal
          open={showAddCase}
          onOpenChange={setShowAddCase}
          onAddCases={handleAddCases}
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
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("MTB DETAIL RENDER ERROR:", err);
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-red-200 p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Render Error</h2>
            <p className="text-sm text-gray-600 mb-4">Failed to render MTB detail page:</p>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 mb-4 overflow-auto max-h-32">
              {errorMessage}
            </div>
            <button
              onClick={() => navigate('/mtbs')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to MTBs
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default MTBDetail;
