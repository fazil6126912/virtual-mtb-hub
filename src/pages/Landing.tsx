import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ArrowRight, FileText, LayoutDashboard, Video, ClipboardCheck } from 'lucide-react';

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

  const features = [
    {
      icon: FileText,
      title: "Anonymize and Digitize patient's data",
      description: "With AI, semi-automatically anonymizes and digitize unstructured reports into a visual clinical timeline."
    },
    {
      icon: LayoutDashboard,
      title: "Unified Case Dashboard",
      description: "Visualize pathology, radiology, and molecular profiling on a single interactive interface—no more toggling between files."
    },
    {
      icon: Video,
      title: "Virtual Boardroom",
      description: "Host secure, multi-disciplinary meetings with integrated video, instant messaging, and one-click expert invitations."
    },
    {
      icon: ClipboardCheck,
      title: "Actionable Consensus",
      description: "Formalize treatment plans within the platform and maintain a longitudinal record of patient follow-ups."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Section 1: Hero */}
      <section 
        className="w-full flex items-center justify-center px-4 py-8 md:px-8 lg:px-16"
        style={{ backgroundColor: '#8ecae6', minHeight: '80vh' }}
      >
        <div className="w-full max-w-7xl" style={{ height: 'calc(80vh - 4rem)' }}>
          {/* Outer rounded container with relative positioning for layering */}
          <div 
            className="rounded-3xl overflow-hidden relative h-full"
          >
            {/* Layer 1: Background Image (bottom layer) */}
            <div className="absolute inset-0 flex">
              <div className="flex-1" /> {/* Empty left space */}
              <div className="flex-1 relative">
                <img 
                  src="/images/landing-hero.png" 
                  alt="Doctors collaborating on precision oncology cases"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Layer 2: Gradient overlay (middle layer) */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, #219ebc 0%, #219ebc 35%, rgba(33, 158, 188, 0.85) 55%, rgba(33, 158, 188, 0.4) 75%, rgba(255, 238, 219, 0) 100%)'
              }}
            />

            {/* Layer 3: Text Content (top layer) */}
            <div className="relative z-10 flex flex-col lg:flex-row items-stretch h-full">
              {/* Left Column - Text Content */}
              <div className="flex-1 flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                  Collaborate with experts to accelerate precision oncology.
                </h1>
                <p className="text-base md:text-lg text-white/80 mb-8 max-w-xl">
                  Our AI-driven platform anonymizes and digitizes complex cases, enabling one-click sharing, seamless expert discussion, and longitudinal outcome tracking in one unified workspace.
                </p>
                <div>
                  <Link 
                    to="/auth" 
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:brightness-110 hover:scale-105"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: '#0c7792'
                    }}
                  >
                    GET STARTED
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column - Empty space for image visibility */}
              <div className="flex-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Features & Services */}
      <section 
        className="w-full py-16 md:py-24 px-4 md:px-8 lg:px-16"
        style={{
          background: 'linear-gradient(180deg, rgba(142, 202, 230, 0.385) 0%, rgba(142, 202, 230, 0.435) 30%, rgba(142, 202, 230, 0.88) 100%), #219ebc'
        }}
      >
        <div className="w-full max-w-5xl mx-auto">
          {/* Section Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12 md:mb-16 italic">
            Our Features & Services.
          </h2>

          {/* Feature Cards */}
          <div className="flex flex-col gap-4 md:gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="rounded-2xl p-6 md:p-8 flex items-start gap-5 md:gap-6 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'rgba(142, 202, 230, 0.35)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  {/* Icon Container */}
                  <div 
                    className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      border: '2px solid rgba(0, 119, 146, 0.4)'
                    }}
                  >
                    <IconComponent 
                      className="w-7 h-7 md:w-8 md:h-8"
                      style={{ color: '#0c7792' }}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1">
                    <h3 
                      className="text-xl md:text-2xl font-semibold mb-2"
                      style={{ color: '#0c7792' }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-white/90 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-6 text-center text-sm text-white/70"
        style={{ backgroundColor: '#219ebc' }}
      >
        © 2025 vMTB. Advancing precision oncology through collaboration.
      </footer>
    </div>
  );
};

export default Landing;
