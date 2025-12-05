import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { User, LogOut, Edit, Mail, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EditProfileModal from './EditProfileModal';
import InvitationsModal, { Invitation } from './InvitationsModal';

/**
 * Header component with full-width layout.
 * Logo flush-left, navigation and user menu flush-right.
 * Includes Edit Profile, Invitations, and Logout options.
 * Shows notification badge for unread invitations.
 */
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logout, updateUser, initializeEmailChange, markInvitationsRead, acceptInvitation, declineInvitation } = useApp();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [invitationsOpen, setInvitationsOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Get pending invitations for current user
  const userInvitations = state.invitations.filter(
    inv => inv.invited_user_email === state.loggedInUser?.email && inv.status === 'pending'
  );
  const unreadCount = userInvitations.filter(inv => !inv.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = (updates: Partial<typeof state.loggedInUser>) => {
    if (state.loggedInUser && updateUser) {
      updateUser(updates);
    }
  };

  const handleEmailChangeInitiate = (newEmail: string) => {
    if (initializeEmailChange) {
      initializeEmailChange(newEmail);
      navigate('/verify-email-otp');
    }
  };

  const handleOpenInvitations = () => {
    setInvitationsOpen(true);
    // Mark all invitations as read when opening the modal
    if (markInvitationsRead) {
      markInvitationsRead();
    }
  };

  const handleAcceptInvitation = (invitation: Invitation) => {
    if (acceptInvitation) {
      acceptInvitation(invitation);
    }
  };

  const handleDeclineInvitation = (invitation: Invitation) => {
    if (declineInvitation) {
      declineInvitation(invitation);
    }
  };

  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Cases', path: '/cases' },
    { label: 'MTBs', path: '/mtbs' },
  ];

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-50">
        {/* Full-width container with small gutters */}
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - flush left */}
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-t from-primary to-primary/60 relative">
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-primary/80 to-transparent rounded-b-full" />
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-300 rounded-full opacity-80" />
                </div>
              </div>
            </Link>

            {/* Navigation - flush right */}
            <nav className="flex items-center gap-6 md:gap-8">
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
                  <button className="relative w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all">
                    {state.loggedInUser?.profilePicture ? (
                      <img
                        src={state.loggedInUser.profilePicture}
                        alt={state.loggedInUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-t from-primary to-primary/60 relative">
                          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-primary/80 to-transparent rounded-b-full" />
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-300 rounded-full opacity-80" />
                        </div>
                      </div>
                    )}
                    {/* Notification badge on profile icon */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {state.loggedInUser && (
                    <div className="px-3 py-2 border-b border-border">
                      <p className="font-medium text-sm">{state.loggedInUser.name}</p>
                      <p className="text-xs text-muted-foreground">{state.loggedInUser.email}</p>
                    </div>
                  )}
                  <DropdownMenuItem onClick={() => setEditProfileOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenInvitations}>
                    <Mail className="w-4 h-4 mr-2" />
                    Invitations
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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

      {/* Edit Profile Modal */}
      {state.loggedInUser && (
        <EditProfileModal
          open={editProfileOpen}
          onOpenChange={setEditProfileOpen}
          user={state.loggedInUser}
          onSave={handleSaveProfile}
          onEmailChangeInitiate={handleEmailChangeInitiate}
        />
      )}

      {/* Invitations Modal */}
      <InvitationsModal
        open={invitationsOpen}
        onOpenChange={setInvitationsOpen}
        invitations={userInvitations}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
      />
    </>
  );
};

export default Header;
