import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Meeting, MeetingNotification, generateId } from '@/lib/storage';
import { toast } from 'sonner';

const MEETINGS_KEY = 'vmtb_meetings';
const NOTIFICATIONS_KEY = 'vmtb_meeting_notifications';

const loadMeetings = (): Meeting[] => {
  try {
    const stored = localStorage.getItem(MEETINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMeetings = (meetings: Meeting[]) => {
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
};

const loadNotifications = (): MeetingNotification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveNotifications = (notifications: MeetingNotification[]) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const useMeetings = () => {
  const { user } = useAuth();
  const { state } = useApp();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<MeetingNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get MTB IDs where the current user is a member or owner
  const getUserMtbIds = useCallback((): string[] => {
    if (!user) return [];
    
    // Get all MTBs where user is owner or member (enrolled)
    const userMtbIds = state.mtbs
      .filter(mtb => mtb.isOwner || !mtb.isOwner) // This includes all MTBs user has access to
      .map(mtb => mtb.id);
    
    return userMtbIds;
  }, [user, state.mtbs]);

  const fetchMeetings = useCallback(() => {
    if (!user) return;
    
    setLoading(true);
    try {
      const allMeetings = loadMeetings();
      const userMtbIds = getUserMtbIds();
      
      // Filter meetings to only include those from MTBs the user is part of
      const userMeetings = allMeetings.filter(m => userMtbIds.includes(m.mtb_id));
      
      setMeetings(userMeetings);
    } finally {
      setLoading(false);
    }
  }, [user, getUserMtbIds]);

  const fetchNotifications = useCallback(() => {
    if (!user) return;

    try {
      const allNotifications = loadNotifications();
      // Filter notifications for current user and attach meeting data
      const userNotifications = allNotifications
        .filter(n => n.user_id === user.id)
        .map(n => ({
          ...n,
          meeting: loadMeetings().find(m => m.id === n.meeting_id),
        }));

      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  const createMeeting = async (
    mtbId: string,
    mtbName: string,
    scheduledDate: Date,
    scheduledTime: string,
    scheduleType: 'once' | 'custom',
    repeatDays: number[] | null
  ) => {
    if (!user) return null;

    try {
      const newMeeting: Meeting = {
        id: generateId(),
        mtb_id: mtbId,
        mtb_name: mtbName,
        created_by: user.id,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        scheduled_time: scheduledTime,
        schedule_type: scheduleType,
        repeat_days: repeatDays,
        created_at: new Date().toISOString(),
      };

      // Save meeting
      const allMeetings = loadMeetings();
      allMeetings.push(newMeeting);
      saveMeetings(allMeetings);
      
      toast.success('Meeting scheduled successfully');
      fetchMeetings();
      return newMeeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to schedule meeting');
      return null;
    }
  };

  // Get meetings for a specific MTB
  const getMeetingsForMTB = useCallback((mtbId: string): Meeting[] => {
    const allMeetings = loadMeetings();
    return allMeetings.filter(m => m.mtb_id === mtbId);
  }, []);

  // Get earliest upcoming meeting for a specific MTB
  const getUpcomingMeetingForMTB = useCallback((mtbId: string): Meeting | null => {
    const mtbMeetings = getMeetingsForMTB(mtbId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingMeetings = mtbMeetings
      .filter(m => {
        const meetingDate = new Date(m.scheduled_date);
        meetingDate.setHours(0, 0, 0, 0);
        return meetingDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`);
        const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
        return dateA.getTime() - dateB.getTime();
      });
    
    return upcomingMeetings[0] || null;
  }, [getMeetingsForMTB]);

  const markNotificationsRead = async () => {
    if (!user || notifications.length === 0) return;

    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      const allNotifications = loadNotifications();
      const updatedNotifications = allNotifications.map(n => 
        unreadIds.includes(n.id) ? { ...n, read: true } : n
      );
      saveNotifications(updatedNotifications);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMeetings();
      fetchNotifications();
    }
  }, [user, fetchMeetings, fetchNotifications]);

  return {
    meetings,
    notifications,
    loading,
    unreadCount,
    createMeeting,
    markNotificationsRead,
    getMeetingsForMTB,
    getUpcomingMeetingForMTB,
    refetch: () => {
      fetchMeetings();
      fetchNotifications();
    },
  };
};
