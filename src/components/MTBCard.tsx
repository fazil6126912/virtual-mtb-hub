import { useNavigate } from 'react-router-dom';
import { MTB } from '@/lib/storage';
import { useApp } from '@/contexts/AppContext';

interface MTBCardProps {
  mtb: MTB;
}

const MTBCard = ({ mtb }: MTBCardProps) => {
  const navigate = useNavigate();
  const { state } = useApp();

  // Calculate actual expert count for this MTB
  const expertCount = state.experts.filter(e => mtb.experts.includes(e.id)).length;
  
  // Calculate actual case count for this MTB
  const caseCount = state.cases.filter(c => mtb.cases.includes(c.id)).length;

  return (
    <div
      onClick={() => navigate(`/mtbs/${mtb.id}`)}
      className="vmtb-card vmtb-card-hover cursor-pointer overflow-hidden animate-fade-in flex flex-col h-full"
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-muted to-muted/50 p-4 relative">
        <div className="pr-16">
          <h3 className="font-semibold text-foreground">{mtb.name}</h3>
          <p className="text-sm text-muted-foreground">{mtb.doctorName}</p>
        </div>
        {/* Avatar - Display actual MTB image if available */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-background">
          {mtb.dpImage ? (
            <img src={mtb.dpImage} alt={mtb.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-t from-primary to-primary/60 relative">
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-primary/80 to-transparent rounded-b-full" />
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-sky-300 rounded-full opacity-80" />
            </div>
          )}
        </div>
      </div>

      {/* Description - Flexible growth */}
      <div className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{mtb.description}</p>
      </div>

      {/* Divider - Fixed */}
      <div className="border-t border-border"></div>

      {/* Footer - Always at bottom */}
      <div className="px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-foreground">{expertCount} {expertCount === 1 ? 'Expert' : 'Experts'}</span>
        <span className="text-foreground">{caseCount} {caseCount === 1 ? 'Case' : 'Cases'}</span>
      </div>
    </div>
  );
};

export default MTBCard;
