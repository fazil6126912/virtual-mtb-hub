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
  const { setCurrentPatient } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !age || !sex || !cancerType) {
      toast.error('Please fill in all fields');
      return;
    }

    setCurrentPatient({ name, age, sex, cancerType });
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-md animate-fade-in">
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

            <button type="submit" className="vmtb-btn-primary w-full">
              Next
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Home;
