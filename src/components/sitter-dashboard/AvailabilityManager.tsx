import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SitterProfile, useUpdateSitterProfile, jsonToAvailability } from "@/hooks/useSitterProfile";
import { SitterAvailability } from "@/lib/availability";
import WeeklyScheduleEditor from "@/components/availability/WeeklyScheduleEditor";
import DateOverridesEditor from "@/components/availability/DateOverridesEditor";

interface AvailabilityManagerProps {
  profile: SitterProfile;
  onUpdate: () => void;
}

const AvailabilityManager = ({ profile, onUpdate }: AvailabilityManagerProps) => {
  const updateProfile = useUpdateSitterProfile();
  
  const [availability, setAvailability] = useState<SitterAvailability>(() =>
    jsonToAvailability(profile.weekly_schedule, profile.availability_overrides)
  );

  useEffect(() => {
    setAvailability(jsonToAvailability(profile.weekly_schedule, profile.availability_overrides));
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ availability });
      toast.success("Availability updated successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Set your regular weekly availability. Pet owners will see these hours when booking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyScheduleEditor
            schedule={availability.weeklySchedule}
            onChange={(schedule) =>
              setAvailability((prev) => ({ ...prev, weeklySchedule: schedule }))
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Date Overrides</CardTitle>
          <CardDescription>
            Block specific dates or add extra availability beyond your regular schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DateOverridesEditor
            overrides={availability.overrides}
            onChange={(overrides) =>
              setAvailability((prev) => ({ ...prev, overrides }))
            }
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Availability
        </Button>
      </div>
    </div>
  );
};

export default AvailabilityManager;
