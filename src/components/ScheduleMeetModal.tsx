import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduleMeetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mtbId: string;
  mtbName: string;
  onSchedule: (
    scheduledDate: Date,
    scheduledTime: string,
    scheduleType: 'once' | 'custom',
    repeatDays: number[] | null
  ) => Promise<void>;
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const ScheduleMeetModal = ({
  open,
  onOpenChange,
  mtbName,
  onSchedule,
}: ScheduleMeetModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [scheduleType, setScheduleType] = useState<'once' | 'custom'>('once');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDayToggle = (dayIndex: number) => {
    setRepeatDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      await onSchedule(
        selectedDate,
        selectedTime,
        scheduleType,
        scheduleType === 'custom' && repeatDays.length > 0 ? repeatDays : null
      );
      onOpenChange(false);
      // Reset state
      setSelectedDate(new Date());
      setSelectedTime('10:00');
      setScheduleType('once');
      setRepeatDays([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = selectedDate && selectedTime && (scheduleType === 'once' || repeatDays.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Schedule a Meeting
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {mtbName}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date & Time Picker */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Date Picker */}
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Type Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Schedule Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setScheduleType('once')}
                className={cn(
                  'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  scheduleType === 'once'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                Schedule Once
              </button>
              <button
                type="button"
                onClick={() => setScheduleType('custom')}
                className={cn(
                  'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  scheduleType === 'custom'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Repeat Days (visible only for custom) */}
          {scheduleType === 'custom' && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-medium text-foreground">Repeat on</label>
              <div className="flex justify-between gap-2">
                {dayLabels.map((label, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDayToggle(index)}
                    className={cn(
                      'w-10 h-10 rounded-full text-sm font-medium transition-all',
                      repeatDays.includes(index)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {scheduleType === 'custom' && repeatDays.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Select at least one day for the meeting to repeat
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!isValid || isSubmitting}
            className="vmtb-btn-primary"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleMeetModal;
