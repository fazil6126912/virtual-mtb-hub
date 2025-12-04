import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AddExpertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, email: string, specialty: string) => void;
}

/**
 * AddExpertModal allows MTB owners to invite new experts.
 * Provides form fields for name, email, and specialty.
 */
const AddExpertModal = ({ open, onOpenChange, onAdd }: AddExpertModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error('Expert name is required');
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!specialty.trim()) {
      toast.error('Specialty is required');
      return;
    }

    onAdd(name.trim(), email.trim(), specialty.trim());
    toast.success('Expert invitation sent');
    setName('');
    setEmail('');
    setSpecialty('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expert</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="vmtb-input"
              placeholder="Expert name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="vmtb-input"
              placeholder="expert@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Specialty</label>
            <input
              type="text"
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="vmtb-input"
              placeholder="e.g., Medical Oncologist"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => onOpenChange(false)} className="vmtb-btn-outline">
            Cancel
          </button>
          <button onClick={handleAdd} className="vmtb-btn-primary">
            Send Invitation
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpertModal;