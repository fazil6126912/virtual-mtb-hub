import { useState } from 'react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import MTBCard from '@/components/MTBCard';
import { useApp } from '@/contexts/AppContext';

const tabs = [
  { id: 'my', label: 'My MTBs' },
  { id: 'enrolled', label: 'Enrolled MTBs' },
];

const MTBsList = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('my');

  const myMTBs = state.mtbs.filter(m => m.isOwner);
  const enrolledMTBs = state.mtbs.filter(m => !m.isOwner);

  const displayedMTBs = activeTab === 'my' ? myMTBs : enrolledMTBs;

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedMTBs.map(mtb => (
            <MTBCard key={mtb.id} mtb={mtb} />
          ))}
        </div>

        {displayedMTBs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No {activeTab === 'my' ? 'owned' : 'enrolled'} MTBs found
          </div>
        )}
      </main>
    </div>
  );
};

export default MTBsList;
