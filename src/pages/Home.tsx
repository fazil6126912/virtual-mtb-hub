import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const Home = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [cancerType, setCancerType] = useState('');
  const [caseName, setCaseName] = useState('');
  const { setCurrentPatient, state } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !age || !sex || !cancerType || !caseName) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check if case name already exists for this user
    const caseNameExists = state.cases.some(
      c => c.caseName === caseName.trim() && c.ownerId === state.loggedInUser?.id
    );
    if (caseNameExists) {
      toast.error('You already have a case with this name. Please choose a different name.');
      return;
    }

    setCurrentPatient({ name, age, sex, cancerType, caseName });
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-home-page relative overflow-hidden">
      {/* Radial gradient accent on right side */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center right, rgba(33, 150, 243, 0.08) 0%, rgba(33, 150, 243, 0) 60%)'
      }} />
      
      <Header />
      
      <main className="relative z-10 max-w-6xl mx-auto px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 items-stretch min-h-[calc(100vh-200px)]">
          {/* Left Column: Form Card */}
          <form onSubmit={handleSubmit} className="animate-fade-in flex flex-col justify-center">
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

              {/* Sex Field */}
              <div className="home-form-field">
                <label className="home-form-label">Sex</label>
                <select
                  value={sex}
                  onChange={e => setSex(e.target.value)}
                  className="home-form-input"
                >
                  <option value="">Select sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Cancer Type Field */}
              <div className="home-form-field">
                <label className="home-form-label">Cancer Type</label>
                <input
                  type="text"
                  value={cancerType}
                  onChange={e => setCancerType(e.target.value)}
                  className="home-form-input"
                  placeholder="e.g., Lung Cancer"
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
              <button type="submit" className="home-btn-next">
                Next
              </button>
            </div>
          </form>

          {/* Right Column: Illustration & Tagline */}
          <div className="hidden lg:flex flex-col items-center justify-center animate-fade-in">
            {/* Illustration Box */}
            <div className="home-illustration-box">
              <svg
                className="w-20 h-20 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="home-heading">
              Organize cases effortlessly with your virtual MTB workspace.
            </h2>

            {/* Subtext */}
            <p className="home-subtext">
              Create, manage, and collaborate on medical cases with ease.
            </p>

            {/* Accent Underline */}
            <div className="home-accent-bar" />
          </div>
        </div>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @media (max-width: 1024px) {
          main {
            padding-top: 4rem;
            padding-bottom: 4rem;
          }
        }

        @media (max-width: 768px) {
          main {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .grid {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }

          .hidden.lg\\:flex {
            display: flex !important;
            width: 100%;
            margin-top: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
