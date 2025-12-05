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
    <div className="min-h-screen bg-muted">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Form */}
          <form onSubmit={handleSubmit} className="animate-fade-in">
            <div className="vmtb-card p-8 space-y-6">
              <div>
                <label className="block text-foreground font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="vmtb-input"
                  placeholder="Patient name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This patient name will remain anonymized and will not be shared with any MTB.
                </p>
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="vmtb-input"
                  placeholder="Patient age"
                  min="0"
                  max="150"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">Sex</label>
                <select
                  value={sex}
                  onChange={e => setSex(e.target.value)}
                  className="vmtb-input"
                >
                  <option value="">Select sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">Cancer Type</label>
                <input
                  type="text"
                  value={cancerType}
                  onChange={e => setCancerType(e.target.value)}
                  className="vmtb-input"
                  placeholder="e.g., Lung Cancer"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">Case Name</label>
                <input
                  type="text"
                  value={caseName}
                  onChange={e => setCaseName(e.target.value)}
                  className="vmtb-input"
                  placeholder="Enter a unique case name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  When you share this case with any MTB, the case will be referenced using this name.
                </p>
              </div>

              <button type="submit" className="vmtb-btn-primary w-full">
                Next
              </button>
            </div>
          </form>

          {/* Right: Illustration & Message */}
          <div className="hidden lg:flex flex-col items-center justify-center py-12 animate-fade-in px-8">
            <div className="relative w-full h-64 mb-8">
              {/* Decorative circles and shapes */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-vmtb-green/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-10 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Center illustration with gradient */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Main icon background */}
                  <div className="w-32 h-32 bg-gradient-to-br from-vmtb-green/20 to-primary/20 rounded-2xl flex items-center justify-center animate-float" style={{ animation: 'float 3s ease-in-out infinite' }}>
                    <svg
                      className="w-16 h-16 text-vmtb-green"
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
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground text-center mb-3">
              Organize cases effortlessly with your virtual MTB workspace.
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Create, manage, and collaborate on medical cases with ease.
            </p>

            {/* Decorative line */}
            <div className="mt-8 w-12 h-1 bg-gradient-to-r from-vmtb-green to-primary rounded-full" />
          </div>
        </div>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default Home;
