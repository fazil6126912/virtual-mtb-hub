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
    <div className="h-screen bg-muted flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        <CaseTable 
          cases={sortedCases} 
          title="My Cases" 
          showBackButton
          onBack={() => navigate(-1)}
        />
      </main>
    </div>
  );
};

export default CasesList;
