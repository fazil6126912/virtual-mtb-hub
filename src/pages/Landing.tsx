import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Landing = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-t from-primary to-primary/60 relative">
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-primary/80 to-transparent rounded-b-full" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-300 rounded-full opacity-80" />
            </div>
          </div>
          <span className="text-xl font-bold text-foreground">vMTB</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center animate-slide-up">
          {/* Large Logo */}
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-t from-primary to-primary/60 relative">
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-primary/80 to-transparent rounded-b-full" />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-sky-300 rounded-full opacity-80" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Virtual Molecular Tumor Board
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto">
            Collaborate with experts worldwide to review and discuss complex cancer cases using advanced molecular profiling.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="vmtb-btn-primary text-center">
              Get Started
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        © 2025 vMTB. Advancing precision oncology through collaboration.
      </footer>
    </div>
  );
};

export default Landing;
