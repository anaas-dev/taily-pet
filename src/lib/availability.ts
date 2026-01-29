// Timezone default
export const DEFAULT_TIMEZONE = 'Europe/Nicosia';

// Days of the week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

// Time slot structure
export interface TimeSlot {
  id: string;
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

// Weekly recurring schedule
export interface WeeklySchedule {
  [key: string]: TimeSlot[]; // key is DayOfWeek
}

// Date override types
export type OverrideType = 'block' | 'open';

export interface DateOverride {
  id: string;
  date: string; // YYYY-MM-DD format (start date for ranges)
  endDate?: string; // YYYY-MM-DD format (for date ranges, undefined means single day)
  type: OverrideType;
  timeSlots?: TimeSlot[]; // For partial blocks or extra open hours
  allDay: boolean; // If true, affects the entire day
}

// Check if a date falls within an override's date range
export const isDateInOverrideRange = (dateStr: string, override: DateOverride): boolean => {
  if (!override.endDate) {
    return dateStr === override.date;
  }
  return dateStr >= override.date && dateStr <= override.endDate;
};

// Confirmed booking
export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD format
  start: string; // HH:mm
  end: string;   // HH:mm
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Full availability configuration for a sitter
export interface SitterAvailability {
  weeklySchedule: WeeklySchedule;
  overrides: DateOverride[];
  bookings: Booking[];
}

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Create default time slot
export const createDefaultTimeSlot = (): TimeSlot => ({
  id: generateId(),
  start: '09:00',
  end: '17:00',
});

// Create empty weekly schedule
export const createEmptyWeeklySchedule = (): WeeklySchedule => {
  const schedule: WeeklySchedule = {};
  DAYS_OF_WEEK.forEach((day) => {
    schedule[day] = [];
  });
  return schedule;
};

// Create default availability
export const createDefaultAvailability = (): SitterAvailability => ({
  weeklySchedule: createEmptyWeeklySchedule(),
  overrides: [],
  bookings: [],
});

// Format date to YYYY-MM-DD
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get day of week from date
export const getDayOfWeek = (date: Date): DayOfWeek => {
  const dayIndex = date.getDay();
  // Convert Sunday=0 to Sunday=6
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return DAYS_OF_WEEK[adjustedIndex];
};

// Parse time string to minutes from midnight
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Check if two time slots overlap
export const timeSlotsOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  const start1 = timeToMinutes(slot1.start);
  const end1 = timeToMinutes(slot1.end);
  const start2 = timeToMinutes(slot2.start);
  const end2 = timeToMinutes(slot2.end);
  
  return start1 < end2 && start2 < end1;
};

// Check if a time range is within a time slot
export const isTimeRangeWithinSlot = (
  rangeStart: string,
  rangeEnd: string,
  slot: TimeSlot
): boolean => {
  const start = timeToMinutes(rangeStart);
  const end = timeToMinutes(rangeEnd);
  const slotStart = timeToMinutes(slot.start);
  const slotEnd = timeToMinutes(slot.end);
  
  return start >= slotStart && end <= slotEnd;
};

// Get available slots for a specific date
export const getAvailableSlotsForDate = (
  date: Date,
  availability: SitterAvailability
): TimeSlot[] => {
  const dateStr = formatDateToString(date);
  const dayOfWeek = getDayOfWeek(date);
  
  // Check for full-day block override (including date ranges)
  const blockOverride = availability.overrides.find(
    (o) => isDateInOverrideRange(dateStr, o) && o.type === 'block' && o.allDay
  );
  
  if (blockOverride) {
    return [];
  }
  
  // Start with weekly schedule
  let slots = [...(availability.weeklySchedule[dayOfWeek] || [])];
  
  // Apply open overrides (add extra hours)
  const openOverrides = availability.overrides.filter(
    (o) => isDateInOverrideRange(dateStr, o) && o.type === 'open'
  );
  
  openOverrides.forEach((override) => {
    if (override.timeSlots) {
      slots = [...slots, ...override.timeSlots];
    }
  });
  
  // Apply partial block overrides
  const partialBlocks = availability.overrides.filter(
    (o) => isDateInOverrideRange(dateStr, o) && o.type === 'block' && !o.allDay && o.timeSlots
  );
  
  partialBlocks.forEach((block) => {
    block.timeSlots?.forEach((blockedSlot) => {
      slots = slots.filter((slot) => !timeSlotsOverlap(slot, blockedSlot));
    });
  });
  
  // Remove time covered by confirmed bookings
  const confirmedBookings = availability.bookings.filter(
    (b) => b.date === dateStr && b.status === 'confirmed'
  );
  
  confirmedBookings.forEach((booking) => {
    const bookingSlot: TimeSlot = {
      id: booking.id,
      start: booking.start,
      end: booking.end,
    };
    slots = slots.filter((slot) => !timeSlotsOverlap(slot, bookingSlot));
  });
  
  return slots;
};

// Check if sitter is available for a specific date and time range
export const isSitterAvailable = (
  date: Date,
  startTime: string,
  endTime: string,
  availability: SitterAvailability
): boolean => {
  const availableSlots = getAvailableSlotsForDate(date, availability);
  
  return availableSlots.some((slot) =>
    isTimeRangeWithinSlot(startTime, endTime, slot)
  );
};

// Check if sitter has any availability on a given date
export const hasAvailabilityOnDate = (
  date: Date,
  availability: SitterAvailability
): boolean => {
  const availableSlots = getAvailableSlotsForDate(date, availability);
  return availableSlots.length > 0;
};

// Format time slot for display
export const formatTimeSlot = (slot: TimeSlot): string => {
  return `${slot.start} - ${slot.end}`;
};

// Generate time options for select (15-minute intervals)
export const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hours = String(h).padStart(2, '0');
      const minutes = String(m).padStart(2, '0');
      options.push(`${hours}:${minutes}`);
    }
  }
  return options;
};

export const TIME_OPTIONS = generateTimeOptions();
