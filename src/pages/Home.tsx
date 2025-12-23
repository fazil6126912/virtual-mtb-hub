import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useMeetings } from '@/hooks/useMeetings';
import { toast } from 'sonner';
import CancerTypeSelect from '@/components/CancerTypeSelect';
import UpcomingMeetingCard from '@/components/UpcomingMeetingCard';
import MeetingsModal from '@/components/MeetingsModal';

const Home = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [cancerType, setCancerType] = useState('');
  const [caseName, setCaseName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meetingsModalOpen, setMeetingsModalOpen] = useState(false);
  
  const { setCurrentPatient } = useApp();
  const { profile } = useAuth();
  const { checkCaseNameExists } = useSupabaseData();
  const { meetings, loading: meetingsLoading } = useMeetings();
  const navigate = useNavigate();

  // Extract doctor name from profile
  const doctorName = profile?.name || '';
  const welcomeText = doctorName ? `Welcome back, Dr. ${doctorName}` : 'Welcome back';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !age || !sex || !cancerType || !caseName) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const caseNameExists = await checkCaseNameExists(caseName.trim());
      if (caseNameExists) {
        toast.error('You already have a case with this name. Please choose a different name.');
        return;
      }

      setCurrentPatient({ name, age, sex, cancerType, caseName: caseName.trim() });
      navigate('/upload');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowMoreMeetings = () => {
    setMeetingsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-home-page relative overflow-hidden">
      {/* Radial gradient accent */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center right, rgba(33, 150, 243, 0.08) 0%, rgba(33, 150, 243, 0) 60%)'
      }} />
      
      <Header />
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-10 items-start min-h-[calc(100vh-150px)]">
          {/* Left Column: Welcome + Meetings */}
          <div className="animate-fade-in pt-4 lg:pt-8">
            {/* Welcome Section */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {welcomeText}
              </h1>
              <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                Ready to discuss with experts you trust?
                <br />
                Start with uploading a case.
              </p>
            </div>

            {/* Upcoming Meetings */}
            <UpcomingMeetingCard onShowMore={handleShowMoreMeetings} />
          </div>

          {/* Right Column: Form Card */}
          <form onSubmit={handleSubmit} className="animate-fade-in">
            <div className="home-form-card">
              {/* Name Field */}
              <div className="home-form-field">
                <label className="home-form-label">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="home-form-input"
                  placeholder="Patient name"
                />
                <p className="home-form-helper">
                  This patient name will remain anonymized and will not be shared with any MTB.
                </p>
              </div>

              {/* Age Field */}
              <div className="home-form-field">
                <label className="home-form-label">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="home-form-input"
                  placeholder="Patient age"
                  min="0"
                  max="150"
                />
              </div>

              {/* Sex Field - Themed dropdown */}
              <div className="home-form-field">
                <label className="home-form-label">Sex</label>
                <div className="relative">
                  <select
                    value={sex}
                    onChange={e => setSex(e.target.value)}
                    className="home-form-input appearance-none pr-10 cursor-pointer"
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Cancer Type Field - Searchable dropdown */}
              <div className="home-form-field">
                <label className="home-form-label">Cancer Type</label>
                <CancerTypeSelect
                  value={cancerType}
                  onChange={setCancerType}
                  placeholder="Search and select cancer type"
                />
              </div>

              {/* Case Name Field */}
              <div className="home-form-field">
                <label className="home-form-label">Case Name</label>
                <input
                  type="text"
                  value={caseName}
                  onChange={e => setCaseName(e.target.value)}
                  className="home-form-input"
                  placeholder="Enter a unique case name"
                />
                <p className="home-form-helper">
                  When you share this case with any MTB, the case will be referenced using this name.
                </p>
              </div>

              {/* Next Button */}
              <button type="submit" className="home-btn-next" disabled={isSubmitting}>
                {isSubmitting ? 'Checking...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Meetings Modal */}
      <MeetingsModal 
        open={meetingsModalOpen} 
        onOpenChange={setMeetingsModalOpen} 
        meetings={meetings}
        loading={meetingsLoading}
      />
    </div>
  );
};

export default Home;
