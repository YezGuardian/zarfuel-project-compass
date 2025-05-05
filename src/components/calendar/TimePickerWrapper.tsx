
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerWrapperProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TimePickerWrapper: React.FC<TimePickerWrapperProps> = ({
  value,
  onChange,
  disabled
}) => {
  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(
    value ? parseInt(value.split(':')[0]) : 0
  );
  const [selectedMinute, setSelectedMinute] = useState(
    value ? parseInt(value.split(':')[1]) : 0
  );
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  // Generate hours and minutes options
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    // Update the input when selectedHour or selectedMinute changes
    const formattedHour = selectedHour.toString().padStart(2, '0');
    const formattedMinute = selectedMinute.toString().padStart(2, '0');
    onChange(`${formattedHour}:${formattedMinute}`);
  }, [selectedHour, selectedMinute, onChange]);

  useEffect(() => {
    // Scroll to selected hour and minute when popover opens
    if (open) {
      setTimeout(() => {
        if (hoursRef.current) {
          const hourElement = hoursRef.current.querySelector(`[data-hour="${selectedHour}"]`);
          if (hourElement) {
            hourElement.scrollIntoView({ block: 'center' });
          }
        }
        if (minutesRef.current) {
          const minuteElement = minutesRef.current.querySelector(`[data-minute="${selectedMinute}"]`);
          if (minuteElement) {
            minuteElement.scrollIntoView({ block: 'center' });
          }
        }
      }, 100);
    }
  }, [open, selectedHour, selectedMinute]);

  // Parse time from input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const value = e.target.value;
    
    if (timeRegex.test(value)) {
      const [hours, minutes] = value.split(':').map(Number);
      setSelectedHour(hours);
      setSelectedMinute(minutes);
      onChange(value);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={value}
            onChange={handleInputChange}
            placeholder="HH:MM"
            className="w-full pr-10"
            disabled={disabled}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setOpen(true)}
            disabled={disabled}
            type="button"
          >
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex w-[250px]">
          <div className="flex-1 border-r">
            <div className="py-2 px-3 text-center text-sm font-medium">Hours</div>
            <ScrollArea className="h-[200px]">
              <div ref={hoursRef} className="py-1">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    data-hour={hour}
                    className={cn(
                      "cursor-pointer px-3 py-2 hover:bg-muted text-center",
                      selectedHour === hour && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      setSelectedHour(hour);
                    }}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex-1">
            <div className="py-2 px-3 text-center text-sm font-medium">Minutes</div>
            <ScrollArea className="h-[200px]">
              <div ref={minutesRef} className="py-1">
                {minutes.map((minute) => (
                  <div
                    key={minute}
                    data-minute={minute}
                    className={cn(
                      "cursor-pointer px-3 py-2 hover:bg-muted text-center",
                      selectedMinute === minute && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      setSelectedMinute(minute);
                    }}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
