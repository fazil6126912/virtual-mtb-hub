import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X, User, Search, Eye, Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import CaseTable from '@/components/CaseTable';
import ExpertList from '@/components/ExpertList';
import AddExpertModal from '@/components/AddExpertModal';
import AddCaseToMTBModal from '@/components/AddCaseToMTBModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useApp } from '@/contexts/AppContext';
import { Case } from '@/lib/storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const sections = [
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
  const { state, removeExpertFromMTB, sendInvitations, addCasesToMTB, deleteCase, removeCaseFromMTB, loadCaseForEditing } = useApp();
  const [activeSection, setActiveSection] = useState('mycases');
  const [showAddExpert, setShowAddExpert] = useState(false);
  const [showAddCase, setShowAddCase] = useState(false);
  const [expertToRemove, setExpertToRemove] = useState<string | null>(null);
  const [removeExpertModalOpen, setRemoveExpertModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  const [deleteCaseModalOpen, setDeleteCaseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);

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
    if (addCasesToMTB) {
      addCasesToMTB(mtb.id, caseIds);
      setShowAddCase(false);
    }
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

  const handleDeleteCaseClick = (caseId: string) => {
    setCaseToDelete(caseId);
    setDeleteCaseModalOpen(true);
  };

  const handleConfirmDeleteCase = () => {
    if (caseToDelete && removeCaseFromMTB) {
      // Remove case from this MTB only (do NOT delete globally)
      removeCaseFromMTB(mtb.id, caseToDelete);
    }
    setDeleteCaseModalOpen(false);
    setCaseToDelete(null);
  };

  const renderTabContent = () => {
    switch (activeSection) {
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
                                caseItem.status === 'Completed' 
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
                                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                                  className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                  title="View case"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => navigate(`/file-preview/${caseItem.id}`)}
                                  className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                                  title="Edit case"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCaseClick(caseItem.id)}                                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
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
                                caseItem.status === 'Completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {caseItem.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-foreground text-sm">{new Date(caseItem.createdDate).toLocaleDateString()}</td>
                            <td className="py-4 px-4">
                              <button 
                                onClick={() => navigate(`/cases/${caseItem.id}`)}                                className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
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
                <p>Invalid section selected: {activeSection}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderSectionContent = (section: string, myCases: typeof state.cases, sharedCases: typeof state.cases, experts: typeof state.experts) => {
    switch (section) {
      case 'mycases':
        return (
          <div className="p-4 md:p-6 animate-fade-in flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 overflow-y-auto">
              <div className="vmtb-card p-6 animate-fade-in">
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
                                caseItem.status === 'Completed' 
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
                                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                                  className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                  title="View case"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (loadCaseForEditing(caseItem.id)) {
                                      navigate(`/upload/preview/0`);
                                    }
                                  }}
                                  className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                                  title="Edit case"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCaseClick(caseItem.id)}
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
                <div className="overflow-x-auto">
                  {sharedCases.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <p>No shared cases in this MTB yet.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Case Name</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Shared By</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Patient Name</th>
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
                            <td className="py-4 px-4 text-foreground text-sm">{state.users.find(u => u.id === caseItem.ownerId)?.name || 'Unknown'}</td>
                            <td className="py-4 px-4 text-foreground">{caseItem.patient.name}</td>
                            <td className="py-4 px-4 text-foreground">
                              {caseItem.patient.age}y, {caseItem.patient.sex.charAt(0).toUpperCase()}
                            </td>
                            <td className="py-4 px-4 text-foreground">{caseItem.patient.cancerType}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                caseItem.status === 'Completed' 
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
                                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                                  className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                  title="View case"
                                >
                                  <Eye className="w-4 h-4" />
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

      case 'experts':
        return (
          <div className="p-4 md:p-6 animate-fade-in flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 overflow-y-auto">
              <ExpertList experts={experts} onRemoveExpert={isOwner ? handleRemoveExpertClick : undefined} />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 md:p-6 animate-fade-in flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Invalid section selected: {section}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  try {
    // Get current section label
    const currentSection = sections.find(s => s.id === activeSection);
    const sectionLabel = currentSection?.label || 'My Cases';

    // Get filtered content based on section and search
    let filteredMyCases = myCases;
    let filteredSharedCases = sharedCases;
    let filteredExperts = displayExperts;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredMyCases = myCases.filter(c => 
        c.caseName.toLowerCase().includes(query) ||
        c.patient.name.toLowerCase().includes(query)
      );
      filteredSharedCases = sharedCases.filter(c =>
        c.caseName.toLowerCase().includes(query) ||
        c.patient.name.toLowerCase().includes(query)
      );
      filteredExperts = displayExperts.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.specialty.toLowerCase().includes(query)
      );
    }

    // Determine if Add button should be shown
    const showAddButton = 
      (activeSection === 'mycases') ||
      (activeSection === 'experts' && isOwner);

    // Determine Add button label and action
    const addButtonLabel = activeSection === 'experts' ? 'Add Expert' : 'Add Case';
    const onAddClick = activeSection === 'experts' ? 
      () => setShowAddExpert(true) : 
      () => setShowAddCase(true);

    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <Header />
        
        {/* Compact Single-Row Header */}
        <div className="bg-background border-b border-border flex-shrink-0 sticky top-12 z-30">
          <div className="w-full px-4 py-1.5">
            <div className="flex items-center justify-between gap-4 h-12">
              {/* Left: DP + Name + Chevron + Section */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* DP */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border flex-shrink-0">
                  {mtb.dpImage ? (
                    <img src={mtb.dpImage} alt={mtb.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary/60" />
                    </div>
                  )}
                </div>

                {/* MTB Name */}
                <span className={`font-semibold text-foreground text-sm ${mtb.name.length > 40 ? 'truncate max-w-[120px]' : ''}`} title={mtb.name}>
                  {mtb.name.length > 40 ? mtb.name.substring(0, 37) + '...' : mtb.name}
                </span>

                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                {/* Section Dropdown */}
                <DropdownMenu open={sectionDropdownOpen} onOpenChange={setSectionDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted transition-colors text-sm text-foreground"
                      aria-haspopup="menu"
                      aria-expanded={sectionDropdownOpen}
                    >
                      <span className="truncate">{sectionLabel}</span>
                      <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {sections.map(section => (
                      <DropdownMenuItem
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          setSectionDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className={activeSection === section.id ? 'bg-primary/10' : ''}
                      >
                        {section.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Right: Add Button + Search */}
              <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                {showAddButton && (
                  <button
                    onClick={onAddClick}
                    className="px-3 py-1.5 vmtb-btn-primary flex items-center gap-1 text-sm whitespace-nowrap rounded-full"
                    aria-label={addButtonLabel}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{addButtonLabel}</span>
                  </button>
                )}
                
                {/* Search Input */}
                <div className="relative hidden sm:flex">
                  <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-9 pr-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-40"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden w-full">
          <div className="h-full overflow-y-auto overscroll-y-none">
            {renderSectionContent(activeSection, filteredMyCases, filteredSharedCases, filteredExperts)}
          </div>
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

        {/* Delete Case Confirmation Modal */}
        <ConfirmModal
          open={deleteCaseModalOpen}
          onOpenChange={setDeleteCaseModalOpen}
          title="Delete Case"
          description="Are you sure you want to delete this case? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDeleteCase}
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
