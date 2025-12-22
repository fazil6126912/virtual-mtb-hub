import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { FileText, Monitor, Users, Clipboard } from 'lucide-react';
import { useEffect, useRef } from 'react';

const Landing = () => {
  const { user, loading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;
      
      e.preventDefault();
      
      const sections = containerRef.current.querySelectorAll('section');
      const currentScroll = window.scrollY;
      
      // Find current section
      let currentSectionIndex = 0;
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          currentSectionIndex = i;
          break;
        }
      }
      
      // Determine scroll direction
      if (e.deltaY > 0 && currentSectionIndex < sections.length - 1) {
        // Scroll down to next section
        sections[currentSectionIndex + 1].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      } else if (e.deltaY < 0 && currentSectionIndex > 0) {
        // Scroll up to previous section
        sections[currentSectionIndex - 1].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

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
        </div>
      </section>

      {/* SECTION 2: FEATURES & SERVICES */}
      <section className="h-screen w-full bg-[#219ebc] relative overflow-hidden flex items-center justify-center px-4 md:px-8">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#8ecae6]/38 via-[#8ecae6]/43 to-[#8ecae6]/88 pointer-events-none"></div>
        
        <div className="w-full max-w-6xl mx-auto my-8 md:my-12 relative z-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-white text-center mb-10">
            Our Features & Services.
          </h2>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-7 shadow-lg border border-white/20">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-white/20 p-5 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Anonymize and Digitize patient's data</h3>
                  <p className="text-white/90">With AI, semi-automatically anonymizes and digitize unstructured reports into a visual clinical timeline.</p>
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-7 shadow-lg border border-white/20">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-white/20 p-5 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <Monitor className="w-10 h-10 text-white" />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Unified Case Dashboard</h3>
                  <p className="text-white/90">Visualize pathology, radiology, and molecular profiling on a single interactive interface—no more toggling between files.</p>
                </div>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-7 shadow-lg border border-white/20">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-white/20 p-5 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Virtual Boardroom</h3>
                  <p className="text-white/90">Host secure, multi-disciplinary meetings with integrated video, instant messaging, and one-click expert invitations.</p>
                </div>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-7 shadow-lg border border-white/20">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-white/20 p-5 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <Clipboard className="w-10 h-10 text-white" />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Actionable Consensus</h3>
                  <p className="text-white/90">Formalize treatment plans within the platform and maintain a longitudinal record of patient follow-ups.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
