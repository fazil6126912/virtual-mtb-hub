import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Case, formatDate } from '@/lib/storage';

interface CaseTableProps {
  cases: Case[];
  title: string;
  basePath?: string;
}

const CaseTable = ({ cases, title, basePath = '/cases' }: CaseTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredCases = cases.filter(c =>
    c.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.patient.cancerType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="vmtb-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {title} ({cases.length})
        </h2>
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Patient Name</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Patient Info</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cancer Type</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Created Date</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map(caseItem => (
              <tr key={caseItem.id} className="border-b border-border last:border-0">
                <td className="py-4 px-4 text-foreground">{caseItem.patient.name}</td>
                <td className="py-4 px-4 text-foreground">
                  {caseItem.patient.age}y, {caseItem.patient.sex.charAt(0).toUpperCase()}
                </td>
                <td className="py-4 px-4 text-foreground">{caseItem.patient.cancerType}</td>
                <td className="py-4 px-4 text-foreground">{caseItem.status}</td>
                <td className="py-4 px-4 text-foreground">{formatDate(caseItem.createdDate)}</td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => navigate(`${basePath}/${caseItem.id}`)}
                    className="flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No cases found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaseTable;
