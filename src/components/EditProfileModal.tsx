import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '@/lib/storage';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSave: (updates: Partial<User>) => void;
  onEmailChangeInitiate?: (newEmail: string) => void;
}

/**
 * EditProfileModal allows users to update their profile information.
 * - Name, phone, and profile picture update instantly
 * - Email change requires OTP verification
 */
const EditProfileModal = ({
  open,
  onOpenChange,
  user,
  onSave,
  onEmailChangeInitiate,
}: EditProfileModalProps) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [profilePicture, setProfilePicture] = useState<string | null>(user.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, and JPEG formats are supported');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicture(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!phone.trim()) {
      toast.error('Phone is required');
      return;
    }

    // Check if email has changed
    const emailChanged = email !== user.email;

    if (emailChanged) {
      // If email changed, initiate OTP verification
      if (onEmailChangeInitiate) {
        onEmailChangeInitiate(email);
        toast.success('OTP sent to your new email address');
        onOpenChange(false);
      }
    } else {
      // If email hasn't changed, save name, phone, and profile picture immediately
      onSave({
        name: name.trim(),
        phone: phone.trim(),
        profilePicture,
      });
      toast.success('Profile updated successfully');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Profile Picture Section */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Profile Picture</label>
            {profilePicture ? (
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={profilePicture}
                  alt="Profile preview"
                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                />
                <div className="flex gap-2 flex-col">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 text-sm bg-vmtb-green text-white rounded hover:bg-opacity-90"
                  >
                    Change
                  </button>
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-vmtb-green hover:bg-green-50 transition"
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (max 5MB)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="vmtb-input"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="vmtb-input"
              placeholder="your@email.com"
            />
            {email !== user.email && (
              <p className="text-xs text-amber-600 mt-1">You will need to verify this email with an OTP</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="vmtb-input"
              placeholder="Phone number"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="vmtb-btn-outline"
          >
            Cancel
          </button>
          <button onClick={handleSave} className="vmtb-btn-primary">
            Save Changes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;