import { Clock } from "lucide-react";
import { TimeSlot, getAvailableSlotsForDate, formatTimeSlot, SitterAvailability } from "@/lib/availability";
import { Badge } from "@/components/ui/badge";

interface AvailabilityIndicatorProps {
  availability: SitterAvailability;
  selectedDate?: Date;
  maxSlotsToShow?: number;
}

const AvailabilityIndicator = ({ 
  availability, 
  selectedDate,
  maxSlotsToShow = 2 
}: AvailabilityIndicatorProps) => {
  if (!selectedDate) {
    return null;
  }

  const availableSlots = getAvailableSlotsForDate(selectedDate, availability);
  
  if (availableSlots.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-3">
        <Clock className="w-4 h-4" />
        <span>No availability on selected date</span>
      </div>
    );
  }

  const slotsToDisplay = availableSlots.slice(0, maxSlotsToShow);
  const remainingSlots = availableSlots.length - maxSlotsToShow;

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="w-4 h-4 text-primary" />
        <span>Available times:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {slotsToDisplay.map((slot) => (
          <Badge 
            key={slot.id} 
            variant="outline" 
            className="bg-primary/5 border-primary/20 text-primary font-normal"
          >
            {formatTimeSlot(slot)}
          </Badge>
        ))}
        {remainingSlots > 0 && (
          <Badge variant="outline" className="bg-muted text-muted-foreground font-normal">
            +{remainingSlots} more
          </Badge>
        )}
      </div>
    </div>
  );
};

export default AvailabilityIndicator;
