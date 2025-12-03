interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabBar = ({ tabs, activeTab, onTabChange }: TabBarProps) => {
  return (
    <div className="flex items-center gap-6 border-b border-border">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`vmtb-tab pb-3 ${activeTab === tab.id ? 'vmtb-tab-active' : ''}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
