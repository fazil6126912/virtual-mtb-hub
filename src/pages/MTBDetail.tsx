import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import CaseTable from '@/components/CaseTable';
import ExpertList from '@/components/ExpertList';
import { useApp } from '@/contexts/AppContext';

const tabs = [
  { id: 'mycases', label: 'My Cases' },
  { id: 'shared', label: 'Shared Cases' },
  { id: 'experts', label: 'Experts' },
];

const MTBDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('mycases');

  const mtb = state.mtbs.find(m => m.id === id);

  if (!mtb) {
    navigate('/mtbs');
    return null;
  }

  // Get cases associated with this MTB (for demo, show all user's cases)
  const myCases = state.cases;
  const sharedCases = state.cases.slice(0, 2); // Mock shared cases

  // Get experts for this MTB
  const mtbExperts = state.experts.filter(e => mtb.experts.includes(e.id));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mycases':
        return (
          <div className="p-6 animate-fade-in">
            <CaseTable cases={myCases} title="My Cases" basePath={`/mtbs/${id}/cases`} />
          </div>
        );

      case 'shared':
        return (
          <div className="p-6 animate-fade-in">
            <CaseTable cases={sharedCases} title="Shared Cases" basePath={`/mtbs/${id}/cases`} />
          </div>
        );

      case 'experts':
        return (
          <div className="p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-6">Board Experts</h2>
            <div className="vmtb-card p-6">
              <ExpertList
                experts={mtbExperts.length > 0 ? mtbExperts : state.experts}
                selectedExpert={null}
                onSelectExpert={() => {}}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <button
              onClick={() => navigate('/mtbs')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default MTBDetail;
