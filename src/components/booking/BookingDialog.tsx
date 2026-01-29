import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sitter: {
    id: string;
    first_name: string;
    last_name: string;
    hourly_rate: number | null;
    email: string;
  };
  onSuccess?: () => void;
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

export function BookingDialog({ open, onOpenChange, sitter, onSuccess }: BookingDialogProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to book a sitter");
      return;
    }

    if (!date || !startTime || !endTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setLoading(true);

    try {
      // Get owner's profile for name
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .single();

      const ownerName = ownerProfile 
        ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() || 'A pet owner'
        : 'A pet owner';

      const { error } = await supabase.from("bookings").insert({
        sitter_id: sitter.id,
        owner_id: user.id,
        date: format(date, "yyyy-MM-dd"),
        start_time: startTime,
        end_time: endTime,
        notes: notes || null,
        status: "pending",
      });

      if (error) throw error;

      // Send email notification to sitter (fire and forget)
      supabase.functions.invoke("send-booking-notification", {
        body: {
          sitterEmail: sitter.email,
          sitterFirstName: sitter.first_name,
          ownerName,
          date: format(date, "yyyy-MM-dd"),
          startTime,
          endTime,
          notes: notes || undefined,
        },
      }).catch((err) => {
        console.error("Failed to send booking notification email:", err);
      });

      toast.success("Booking request sent! The sitter will respond soon.");
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate(undefined);
    setStartTime("");
    setEndTime("");
    setNotes("");
  };

  const calculateTotal = () => {
    if (!startTime || !endTime || !sitter.hourly_rate) return null;
    
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationHours = (endMinutes - startMinutes) / 60;
    
    if (durationHours <= 0) return null;
    
    return (durationHours * sitter.hourly_rate).toFixed(2);
  };

  const total = calculateTotal();

  // Filter end times to only show times after start time
  const availableEndTimes = startTime 
    ? timeSlots.filter(time => time > startTime)
    : timeSlots;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {sitter.first_name} {sitter.last_name}</DialogTitle>
          <DialogDescription>
            Select a date and time for your pet care session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={startTime} onValueChange={(val) => {
                setStartTime(val);
                // Reset end time if it's before or equal to new start time
                if (endTime && endTime <= val) {
                  setEndTime("");
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Start">
                    {startTime && (
                      <span className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {startTime}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
                <SelectTrigger>
                  <SelectValue placeholder="End">
                    {endTime && (
                      <span className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {endTime}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableEndTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Tell the sitter about your pet, special requirements, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Price Summary */}
          {total && (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estimated Total</span>
                <span className="text-xl font-bold text-primary">€{total}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on €{sitter.hourly_rate}/hour
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !date || !startTime || !endTime}>
            {loading ? "Booking..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
