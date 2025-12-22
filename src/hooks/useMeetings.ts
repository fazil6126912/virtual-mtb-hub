import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Meeting {
  id: string;
  mtb_id: string;
  mtb_name?: string;
  created_by: string;
  scheduled_date: string;
  scheduled_time: string;
  schedule_type: 'once' | 'custom';
  repeat_days: number[] | null;
  created_at: string;
}

export interface MeetingNotification {
  id: string;
  meeting_id: string;
  user_id: string;
  read: boolean;
  meeting?: Meeting;
}

export const useMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<MeetingNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMeetings = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch meetings with MTB names
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select(`
          *,
          mtbs (name)
        `)
        .order('scheduled_date', { ascending: true });

      if (meetingsError) throw meetingsError;

      const formattedMeetings = meetingsData?.map(m => ({
        ...m,
        mtb_name: m.mtbs?.name,
        schedule_type: m.schedule_type as 'once' | 'custom',
      })) || [];

      setMeetings(formattedMeetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meeting_notifications')
        .select(`
          *,
          meetings (
            *,
            mtbs (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications = data?.map(n => ({
        ...n,
        meeting: n.meetings ? {
          ...n.meetings,
          mtb_name: n.meetings.mtbs?.name,
          schedule_type: n.meetings.schedule_type as 'once' | 'custom',
        } : undefined,
      })) || [];

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  const createMeeting = async (
    mtbId: string,
    scheduledDate: Date,
    scheduledTime: string,
    scheduleType: 'once' | 'custom',
    repeatDays: number[] | null
  ) => {
    if (!user) return null;

    try {
      // Create the meeting
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          mtb_id: mtbId,
          created_by: user.id,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          scheduled_time: scheduledTime,
          schedule_type: scheduleType,
          repeat_days: repeatDays,
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Get all MTB members (excluding the creator)
      const { data: membersData, error: membersError } = await supabase
        .from('mtb_members')
        .select('user_id')
        .eq('mtb_id', mtbId)
        .neq('user_id', user.id);

      if (membersError) throw membersError;

      // Create notifications for all members
      if (membersData && membersData.length > 0) {
        const notifications = membersData.map(member => ({
          meeting_id: meetingData.id,
          user_id: member.user_id,
        }));

        const { error: notifError } = await supabase
          .from('meeting_notifications')
          .insert(notifications);

        if (notifError) throw notifError;
      }

      toast.success('Meeting scheduled successfully');
      await fetchMeetings();
      return meetingData;
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
      const { error } = await supabase
        .from('meeting_notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) throw error;

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
