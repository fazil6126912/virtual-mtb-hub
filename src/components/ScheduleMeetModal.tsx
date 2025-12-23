import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';

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
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWeekdayToggle = (dayIndex: number) => {
    setSelectedWeekdays(prev => {
      const newWeekdays = prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex];
      
      // Update selected dates based on new weekday selection
      updateSelectedDatesForWeekdays(newWeekdays);
      return newWeekdays;
    });
  };

  // Update selected dates when weekdays change - selects all future dates matching those weekdays
  const updateSelectedDatesForWeekdays = (weekdays: number[]) => {
    if (weekdays.length === 0) return;
    
    const today = startOfDay(new Date());
    const futureMonths = 3; // Look ahead 3 months
    const endDate = addMonths(today, futureMonths);
    const allDays = eachDayOfInterval({ start: today, end: endDate });
    
    // Get dates that match selected weekdays and aren't in the past
    const weekdayDates = allDays.filter(day => {
      const dayOfWeek = getDay(day);
      return weekdays.includes(dayOfWeek) && !isBefore(startOfDay(day), today);
    });
    
    // Merge with manually selected dates (preserve dates that don't match weekdays)
    setSelectedDates(prev => {
      const manualDates = prev.filter(d => !weekdays.includes(getDay(d)));
      const merged = [...manualDates, ...weekdayDates];
      // Remove duplicates
      return merged.filter((date, index, self) => 
        index === self.findIndex(d => isSameDay(d, date))
      );
    });
  };

  const handleDateToggle = (date: Date) => {
    // Don't allow selecting dates in the past
    if (isBefore(startOfDay(date), startOfDay(new Date()))) return;

    setSelectedDates(prev => {
      const exists = prev.some(d => isSameDay(d, date));
      if (exists) {
        return prev.filter(d => !isSameDay(d, date));
      }
      return [...prev, date];
    });
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(d => isSameDay(d, date));
  };

  const handleSchedule = async () => {
    if (!selectedTime) return;
    if (selectedDates.length === 0 && selectedWeekdays.length === 0) return;

    setIsSubmitting(true);
    try {
      // Use the first selected date or today if only weekdays are selected
      const baseDate = selectedDates.length > 0 ? selectedDates[0] : new Date();
      const scheduleType = selectedWeekdays.length > 0 ? 'custom' : 'once';
      
      await onSchedule(
        baseDate,
        selectedTime,
        scheduleType,
        selectedWeekdays.length > 0 ? selectedWeekdays : null
      );
      
      onOpenChange(false);
      // Reset state
      setSelectedTime('10:00');
      setSelectedWeekdays([]);
      setSelectedDates([]);
      setCurrentMonth(new Date());
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = selectedTime && (selectedDates.length > 0 || selectedWeekdays.length > 0);

  // Calendar generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // Create empty cells for days before month starts
  const emptyCells = Array(startDayOfWeek).fill(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Schedule a Meeting
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {mtbName}
          </p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
          {/* Time Picker */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Select Time</label>
            <div className="flex items-center justify-center">
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="text-4xl font-light text-center py-3 px-6 border-2 border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              />
            </div>
          </div>

          {/* Weekday Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Repeat Weekly</label>
            <div className="flex justify-between gap-2">
              {dayLabels.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleWeekdayToggle(index)}
                  className={cn(
                    'w-10 h-10 rounded-full text-sm font-medium transition-all duration-200',
                    selectedWeekdays.includes(index)
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {selectedWeekdays.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Repeats every {selectedWeekdays.map(d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]).join(', ')}
              </p>
            )}
          </div>

          {/* Calendar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Select Date(s)</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-muted/30 rounded-xl p-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayLabels.map((label, index) => (
                  <div
                    key={index}
                    className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {emptyCells.map((_, index) => (
                  <div key={`empty-${index}`} className="h-9" />
                ))}
                {daysInMonth.map((day) => {
                  const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                  const isSelected = isDateSelected(day);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => handleDateToggle(day)}
                      disabled={isPast}
                      className={cn(
                        'h-9 w-full rounded-lg text-sm font-medium transition-all duration-200',
                        isPast && 'text-muted-foreground/40 cursor-not-allowed',
                        !isPast && !isSelected && 'hover:bg-muted text-foreground',
                        isSelected && 'bg-primary text-primary-foreground shadow-md',
                        isTodayDate && !isSelected && 'ring-1 ring-primary/50'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDates.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleMeetModal;
