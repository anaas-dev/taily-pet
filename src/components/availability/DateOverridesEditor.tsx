import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CalendarIcon, Ban, CalendarPlus, CalendarRange } from "lucide-react";
import { format, parseISO, eachDayOfInterval, isAfter, isBefore } from "date-fns";
import {
  DateOverride,
  TimeSlot,
  OverrideType,
  TIME_OPTIONS,
  generateId,
  createDefaultTimeSlot,
  formatTimeSlot,
  formatDateToString,
} from "@/lib/availability";
import { cn } from "@/lib/utils";

interface DateOverridesEditorProps {
  overrides: DateOverride[];
  onChange: (overrides: DateOverride[]) => void;
}

type AddMode = 'single' | 'range';

const DateOverridesEditor = ({ overrides, onChange }: DateOverridesEditorProps) => {
  const [isAddingOverride, setIsAddingOverride] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('single');
  const [newOverride, setNewOverride] = useState<{
    date: Date | undefined;
    endDate: Date | undefined;
    type: OverrideType;
    allDay: boolean;
    timeSlots: TimeSlot[];
  }>({
    date: undefined,
    endDate: undefined,
    type: "block",
    allDay: true,
    timeSlots: [],
  });

  const resetForm = () => {
    setNewOverride({
      date: undefined,
      endDate: undefined,
      type: "block",
      allDay: true,
      timeSlots: [],
    });
    setAddMode('single');
    setIsAddingOverride(false);
  };

  const addOverride = () => {
    if (!newOverride.date) return;

    // Validate date range
    if (addMode === 'range' && newOverride.endDate) {
      if (isBefore(newOverride.endDate, newOverride.date)) {
        return; // End date must be after start date
      }
    }

    const override: DateOverride = {
      id: generateId(),
      date: formatDateToString(newOverride.date),
      endDate: addMode === 'range' && newOverride.endDate 
        ? formatDateToString(newOverride.endDate) 
        : undefined,
      type: newOverride.type,
      allDay: newOverride.allDay,
      timeSlots: newOverride.allDay ? undefined : newOverride.timeSlots,
    };

    onChange([...overrides, override]);
    resetForm();
  };

  const removeOverride = (id: string) => {
    onChange(overrides.filter((o) => o.id !== id));
  };

  const addTimeSlotToNew = () => {
    setNewOverride((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, createDefaultTimeSlot()],
    }));
  };

  const updateTimeSlotInNew = (
    slotId: string,
    field: "start" | "end",
    value: string
  ) => {
    setNewOverride((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot) =>
        slot.id === slotId ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const removeTimeSlotFromNew = (slotId: string) => {
    setNewOverride((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((slot) => slot.id !== slotId),
    }));
  };

  const sortedOverrides = Array.isArray(overrides) 
    ? [...overrides].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const formatOverrideDateDisplay = (override: DateOverride): string => {
    const startDate = format(parseISO(override.date), "MMM d, yyyy");
    if (override.endDate) {
      const endDate = format(parseISO(override.endDate), "MMM d, yyyy");
      return `${startDate} - ${endDate}`;
    }
    return format(parseISO(override.date), "EEEE, MMMM d, yyyy");
  };

  const getDaysCount = (override: DateOverride): number => {
    if (!override.endDate) return 1;
    const days = eachDayOfInterval({
      start: parseISO(override.date),
      end: parseISO(override.endDate),
    });
    return days.length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Date Overrides</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Block days/ranges or add extra available hours
          </p>
        </div>
        {!isAddingOverride && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingOverride(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Override
          </Button>
        )}
      </div>

      {isAddingOverride && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-4">
            {/* Mode selector */}
            <div className="flex items-center gap-2">
              <Button
                variant={addMode === 'single' ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setAddMode('single');
                  setNewOverride(prev => ({ ...prev, endDate: undefined }));
                }}
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Single Date
              </Button>
              <Button
                variant={addMode === 'range' ? "default" : "outline"}
                size="sm"
                onClick={() => setAddMode('range')}
              >
                <CalendarRange className="h-4 w-4 mr-1" />
                Date Range
              </Button>
            </div>

            {/* Date pickers */}
            <div className="flex items-center gap-4 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48 justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newOverride.date
                      ? format(newOverride.date, "PPP")
                      : addMode === 'range' ? "Start date" : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newOverride.date}
                    onSelect={(date) =>
                      setNewOverride((prev) => ({ ...prev, date }))
                    }
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {addMode === 'range' && (
                <>
                  <span className="text-muted-foreground">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-48 justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newOverride.endDate
                          ? format(newOverride.endDate, "PPP")
                          : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newOverride.endDate}
                        onSelect={(date) =>
                          setNewOverride((prev) => ({ ...prev, endDate: date }))
                        }
                        disabled={(date) => 
                          date < new Date() || 
                          (newOverride.date ? date < newOverride.date : false)
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </>
              )}
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-2">
              <Button
                variant={newOverride.type === "block" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setNewOverride((prev) => ({ ...prev, type: "block" }))
                }
              >
                <Ban className="h-4 w-4 mr-1" />
                Block
              </Button>
              <Button
                variant={newOverride.type === "open" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setNewOverride((prev) => ({
                    ...prev,
                    type: "open",
                    allDay: false,
                    timeSlots:
                      prev.timeSlots.length > 0
                        ? prev.timeSlots
                        : [createDefaultTimeSlot()],
                  }))
                }
              >
                <CalendarPlus className="h-4 w-4 mr-1" />
                Open Extra
              </Button>
            </div>

            {newOverride.type === "block" && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={newOverride.allDay}
                  onCheckedChange={(checked) =>
                    setNewOverride((prev) => ({
                      ...prev,
                      allDay: checked,
                      timeSlots: checked ? [] : [createDefaultTimeSlot()],
                    }))
                  }
                />
                <Label>Block entire day{addMode === 'range' ? 's' : ''}</Label>
              </div>
            )}

            {(!newOverride.allDay || newOverride.type === "open") && (
              <div className="space-y-2">
                <Label className="text-sm">
                  {newOverride.type === "block"
                    ? "Hours to block:"
                    : "Extra hours to open:"}
                </Label>
                {newOverride.timeSlots.map((slot, index) => (
                  <div key={slot.id} className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground w-16">
                      Slot {index + 1}:
                    </span>
                    <Select
                      value={slot.start}
                      onValueChange={(value) =>
                        updateTimeSlotInNew(slot.id, "start", value)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">to</span>
                    <Select
                      value={slot.end}
                      onValueChange={(value) =>
                        updateTimeSlotInNew(slot.id, "end", value)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeTimeSlotFromNew(slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addTimeSlotToNew}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Slot
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={addOverride} 
                disabled={!newOverride.date || (addMode === 'range' && !newOverride.endDate)}
              >
                Add Override
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sortedOverrides.length > 0 ? (
        <div className="space-y-2">
          {sortedOverrides.map((override) => (
            <div
              key={override.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                override.type === "block"
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-primary/5 border-primary/20"
              )}
            >
              <div className="flex items-center gap-3">
                {override.type === "block" ? (
                  override.endDate ? (
                    <CalendarRange className="h-4 w-4 text-destructive" />
                  ) : (
                    <Ban className="h-4 w-4 text-destructive" />
                  )
                ) : (
                  <CalendarPlus className="h-4 w-4 text-primary" />
                )}
                <div>
                  <span className="font-medium">
                    {formatOverrideDateDisplay(override)}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge
                      variant={
                        override.type === "block" ? "destructive" : "default"
                      }
                      className="text-xs"
                    >
                      {override.type === "block" ? "Blocked" : "Extra Hours"}
                    </Badge>
                    {override.endDate && (
                      <Badge variant="secondary" className="text-xs">
                        {getDaysCount(override)} days
                      </Badge>
                    )}
                    {override.allDay && (
                      <Badge variant="secondary" className="text-xs">
                        All Day
                      </Badge>
                    )}
                    {!override.allDay &&
                      override.timeSlots?.map((slot) => (
                        <Badge
                          key={slot.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {formatTimeSlot(slot)}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeOverride(override.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        !isAddingOverride && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No date overrides set. Your weekly schedule applies to all dates.
          </p>
        )
      )}
    </div>
  );
};

export default DateOverridesEditor;