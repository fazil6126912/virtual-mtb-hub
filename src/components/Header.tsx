import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logout } = useApp();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Cases', path: '/cases' },
    { label: 'MTBs', path: '/mtbs' },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-t from-primary to-primary/60 relative">
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-primary/80 to-transparent rounded-b-full" />
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-300 rounded-full opacity-80" />
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`vmtb-tab ${isActive(item.path) ? 'vmtb-tab-active' : ''}`}
              >
                {item.label}
              </Link>
            ))}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center hover:from-primary/30 hover:to-primary/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-t from-primary to-primary/60 relative">
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-primary/80 to-transparent rounded-b-full" />
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-300 rounded-full opacity-80" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {state.loggedInUser && (
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-medium text-sm">{state.loggedInUser.name}</p>
                    <p className="text-xs text-muted-foreground">{state.loggedInUser.email}</p>
                  </div>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
