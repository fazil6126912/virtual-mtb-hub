import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<MeetingNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMeetings = useCallback(() => {
    if (!user) return;
    
    setLoading(true);
    try {
      const allMeetings = loadMeetings();
      setMeetings(allMeetings);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

      // Get MTB members from localStorage (simplified - in real app would be from state)
      // For now, we'll create a notification that the creator won't see
      // Since we don't have real MTB members in localStorage, we'll skip member notifications
      // The meeting will still appear in the creator's Meetings section
      
      toast.success('Meeting scheduled successfully');
      fetchMeetings();
      return newMeeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to schedule meeting');
      return null;
    }
  };

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
    refetch: () => {
      fetchMeetings();
      fetchNotifications();
    },
  };
};
