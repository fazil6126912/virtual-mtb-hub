import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import CaseTable from '@/components/CaseTable';
import { useApp } from '@/contexts/AppContext';

const CasesList = () => {
  const navigate = useNavigate();
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="vmtb-tab-active text-foreground">My Cases</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <CaseTable cases={state.cases} title="My Cases" />
      </main>
    </div>
  );
};

export default CasesList;
