import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Copy } from "lucide-react";
import {
  WeeklySchedule,
  TimeSlot,
  DayOfWeek,
  DAYS_OF_WEEK,
  TIME_OPTIONS,
  generateId,
  createDefaultTimeSlot,
  formatTimeSlot,
} from "@/lib/availability";
import { cn } from "@/lib/utils";

interface WeeklyScheduleEditorProps {
  schedule: WeeklySchedule;
  onChange: (schedule: WeeklySchedule) => void;
}

const WeeklyScheduleEditor = ({ schedule, onChange }: WeeklyScheduleEditorProps) => {
  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(null);

  const toggleDayEnabled = (day: DayOfWeek) => {
    const newSchedule = { ...schedule };
    if (newSchedule[day].length > 0) {
      newSchedule[day] = [];
    } else {
      newSchedule[day] = [createDefaultTimeSlot()];
    }
    onChange(newSchedule);
  };

  const addTimeSlot = (day: DayOfWeek) => {
    const newSchedule = { ...schedule };
    newSchedule[day] = [...newSchedule[day], createDefaultTimeSlot()];
    onChange(newSchedule);
  };

  const removeTimeSlot = (day: DayOfWeek, slotId: string) => {
    const newSchedule = { ...schedule };
    newSchedule[day] = newSchedule[day].filter((slot) => slot.id !== slotId);
    onChange(newSchedule);
  };

  const updateTimeSlot = (
    day: DayOfWeek,
    slotId: string,
    field: "start" | "end",
    value: string
  ) => {
    const newSchedule = { ...schedule };
    newSchedule[day] = newSchedule[day].map((slot) =>
      slot.id === slotId ? { ...slot, [field]: value } : slot
    );
    onChange(newSchedule);
  };

  const copyToAllDays = (sourceDay: DayOfWeek) => {
    const newSchedule = { ...schedule };
    const sourceSlots = schedule[sourceDay];
    DAYS_OF_WEEK.forEach((day) => {
      if (day !== sourceDay) {
        newSchedule[day] = sourceSlots.map((slot) => ({
          ...slot,
          id: generateId(),
        }));
      }
    });
    onChange(newSchedule);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Weekly Schedule</Label>
        <p className="text-xs text-muted-foreground">Set your recurring availability</p>
      </div>

      <div className="space-y-2">
        {DAYS_OF_WEEK.map((day) => {
          const slots = (schedule && schedule[day]) || [];
          const isEnabled = Array.isArray(slots) && slots.length > 0;
          const isExpanded = expandedDay === day;

          return (
            <Card
              key={day}
              className={cn(
                "transition-all",
                isEnabled ? "border-primary/30 bg-primary/5" : "border-border"
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleDayEnabled(day)}
                    />
                    <span
                      className={cn(
                        "font-medium cursor-pointer",
                        isEnabled ? "text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => setExpandedDay(isExpanded ? null : day)}
                    >
                      {day}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEnabled && (
                      <>
                        <span className="text-sm text-muted-foreground">
                          {slots.length} slot{slots.length !== 1 ? "s" : ""}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyToAllDays(day)}
                          title="Copy to all days"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedDay(isExpanded ? null : day)}
                      disabled={!isEnabled}
                    >
                      {isExpanded ? "Collapse" : "Edit"}
                    </Button>
                  </div>
                </div>

                {isEnabled && !isExpanded && slots.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {slots.map((slot) => (
                      <span
                        key={slot.id}
                        className="text-xs bg-secondary px-2 py-1 rounded"
                      >
                        {formatTimeSlot(slot)}
                      </span>
                    ))}
                  </div>
                )}

                {isEnabled && isExpanded && (
                  <div className="mt-4 space-y-3">
                    {slots.map((slot, index) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-2 flex-wrap"
                      >
                        <span className="text-sm text-muted-foreground w-16">
                          Slot {index + 1}:
                        </span>
                        <Select
                          value={slot.start}
                          onValueChange={(value) =>
                            updateTimeSlot(day, slot.id, "start", value)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={`start-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">to</span>
                        <Select
                          value={slot.end}
                          onValueChange={(value) =>
                            updateTimeSlot(day, slot.id, "end", value)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={`end-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeTimeSlot(day, slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(day)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Time Slot
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyScheduleEditor;
