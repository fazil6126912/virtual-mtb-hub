import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import CaseTable from '@/components/CaseTable';
import { useApp } from '@/contexts/AppContext';

const CasesList = () => {
  const navigate = useNavigate();
  const { state } = useApp();

  // Sort cases by created date descending (newest first)
  const sortedCases = [...state.cases].sort((a, b) => {
    const dateA = new Date(a.createdDate).getTime();
    const dateB = new Date(b.createdDate).getTime();
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          <CaseTable 
            cases={sortedCases} 
            title="My Cases" 
            showBackButton
            onBack={() => navigate(-1)}
          />
        </div>
      </main>
    </div>
  );
};

export default CasesList;
