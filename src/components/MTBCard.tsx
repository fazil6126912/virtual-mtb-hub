import { useNavigate } from 'react-router-dom';
import { MTB } from '@/lib/storage';

interface MTBCardProps {
  mtb: MTB;
}

const MTBCard = ({ mtb }: MTBCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/mtbs/${mtb.id}`)}
      className="vmtb-card vmtb-card-hover cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-muted to-muted/50 p-4 relative">
        <div className="pr-16">
          <h3 className="font-semibold text-foreground">{mtb.name}</h3>
          <p className="text-sm text-muted-foreground">{mtb.doctorName}</p>
        </div>
        {/* Avatar */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-t from-primary to-primary/60 relative">
            <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-primary/80 to-transparent rounded-b-full" />
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-sky-300 rounded-full opacity-80" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{mtb.description}</p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm">
        <span className="text-foreground">{mtb.expertsCount} Experts</span>
        <span className="text-foreground">{mtb.casesCount} Cases</span>
      </div>
    </div>
  );
};

export default MTBCard;
