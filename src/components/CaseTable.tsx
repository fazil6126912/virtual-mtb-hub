import { Eye, Search, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Case, formatDate } from '@/lib/storage';
import ConfirmModal from '@/components/ConfirmModal';
import { useApp } from '@/contexts/AppContext';

interface CaseTableProps {
  cases: Case[];
  title: string;
  basePath?: string;
  showActions?: 'all' | 'view-only'; // 'all' for My Cases, 'view-only' for Shared Cases
  showBackButton?: boolean;
  onBack?: () => void;
  onEditCase?: (caseId: string) => void;
  showPatientName?: boolean; // If false, show case name in second column instead
}

/**
 * CaseTable with View/Edit/Delete actions
 * - View (green eye icon): Navigate to CaseView
 * - Edit (blue pencil icon): Navigate to file preview/digitization page
 * - Delete (red trash icon): Show confirmation modal and delete
 * - Shared Cases only show View icon
 */
const CaseTable = ({ 
  cases, 
  title, 
  basePath = '/cases',
  showActions = 'all',
  showBackButton = false,
  onBack,
  onEditCase,
  showPatientName = true
}: CaseTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const navigate = useNavigate();
  const { deleteCase } = useApp();

  const filteredCases = cases.filter(c =>
    c.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.caseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.patient.cancerType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (caseId: string) => {
    navigate(`${basePath}/${caseId}`);
  };

  const handleEdit = (caseItem: Case) => {
    // Navigate to file preview page with the first file
    if (caseItem.files.length > 0) {
      navigate(`/file-preview/${caseItem.id}`);
    }
    onEditCase?.(caseItem.id);
  };

  const handleDeleteClick = (caseItem: Case) => {
    setCaseToDelete(caseItem);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (caseToDelete && deleteCase) {
      deleteCase(caseToDelete.id);
    }
    setDeleteModalOpen(false);
    setCaseToDelete(null);
  };

  return (
    <>
      <div className="vmtb-card p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Go back"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Case Name</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">{showPatientName ? 'Patient Name' : 'Case Name'}</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Patient Info</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cancer Type</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Created Date</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(caseItem => (
                <tr key={caseItem.id} className="border-b border-border last:border-0">
                  <td className="py-4 px-4 text-foreground font-medium">{caseItem.caseName}</td>
                  <td className="py-4 px-4 text-foreground">{showPatientName ? caseItem.patient.name : caseItem.caseName}</td>
                  <td className="py-4 px-4 text-foreground">
                    {caseItem.patient.age}y, {caseItem.patient.sex.charAt(0).toUpperCase()}
                  </td>
                  <td className="py-4 px-4 text-foreground">{caseItem.patient.cancerType}</td>
                  <td className="py-4 px-4 text-foreground">{caseItem.status}</td>
                  <td className="py-4 px-4 text-foreground">{formatDate(caseItem.createdDate)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {/* View Icon - Green */}
                      <button
                        onClick={() => handleView(caseItem.id)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="View Case"
                        aria-label="View case"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {showActions === 'all' && (
                        <>
                          {/* Edit Icon - Blue */}
                          <button
                            onClick={() => handleEdit(caseItem)}
                            className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                            title="Edit Case"
                            aria-label="Edit case"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete Icon - Red */}
                          <button
                            onClick={() => handleDeleteClick(caseItem)}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                            title="Delete Case"
                            aria-label="Delete case"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No cases found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Case"
        description={`Are you sure you want to delete the case for ${caseToDelete?.patient.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        destructive
      />
    </>
  );
};

export default CaseTable;
