import { Calendar, Clock, Video, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatTime12Hour, formatMeetingDateDisplay, isJoinEnabled } from '@/lib/meetingUtils';
import type { Meeting } from '@/lib/storage';

interface MeetingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetings: Meeting[];
  loading?: boolean;
  onJoin?: (meeting: Meeting) => void;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MeetingsModal = ({
  open,
  onOpenChange,
  meetings,
  loading,
  onJoin,
}: MeetingsModalProps) => {
  const formatRepeatDays = (days: number[] | null) => {
    if (!days || days.length === 0) return null;
    return days.map(d => dayNames[d]).join(', ');
  };

  const getMeetingStatus = (dateStr: string, timeStr: string) => {
    const meetingDateTime = new Date(`${dateStr}T${timeStr}`);
    if (isPast(meetingDateTime)) return 'past';
    return 'upcoming';
  };

  // Filter to show only upcoming meetings or today's meetings
  const upcomingMeetings = meetings.filter(m => {
    const status = getMeetingStatus(m.scheduled_date, m.scheduled_time);
    return status === 'upcoming' || isToday(parseISO(m.scheduled_date));
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Scheduled Meetings
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No upcoming meetings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => {
                const status = getMeetingStatus(meeting.scheduled_date, meeting.scheduled_time);
                const isNow = isToday(parseISO(meeting.scheduled_date));
                
                return (
                  <div
                    key={meeting.id}
                    className={cn(
                      'p-4 rounded-xl border transition-all duration-200',
                      isNow 
                        ? 'border-primary/30 bg-primary/5' 
                        : 'border-border bg-card hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {meeting.mtb_name || 'MTB Meeting'}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{formatMeetingDateDisplay(meeting.scheduled_date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{formatTime12Hour(meeting.scheduled_time)}</span>
                          </div>
                        </div>

                        {meeting.schedule_type === 'custom' && meeting.repeat_days && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <RefreshCw className="w-3.5 h-3.5 text-primary" />
                            <span>Repeats: {formatRepeatDays(meeting.repeat_days)}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => onJoin?.(meeting)}
                        variant={isJoinEnabled(meeting) ? "default" : "secondary"}
                        disabled={!isJoinEnabled(meeting)}
                        className="flex-shrink-0 gap-1.5"
                      >
                        <Video className="w-4 h-4" />
                        Join
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingsModal;
