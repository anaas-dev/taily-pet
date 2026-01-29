import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SitterAvailability, isSitterAvailable, hasAvailabilityOnDate, formatDateToString } from "@/lib/availability";
import { Json } from "@/integrations/supabase/types";
import { eachDayOfInterval } from "date-fns";

export interface SitterProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  experience: string;
  services: string[];
  acceptedPetTypes: string[];
  acceptedPetSizes: string[];
  town: string;
  address: string;
  availability: SitterAvailability;
  hourlyRate: string;
  photos: string[];
}

export interface SitterProfile {
  id: string;
  user_id: string;
  status: "pending_approval" | "active" | "rejected" | "suspended";
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  experience: string | null;
  hourly_rate: number | null;
  services: string[];
  accepted_pet_types: string[];
  accepted_pet_sizes: string[];
  town: string;
  address: string | null;
  photos: string[];
  weekly_schedule: Json;
  availability_overrides: Json;
  approximate_latitude: number | null;
  approximate_longitude: number | null;
  created_at: string;
  updated_at: string;
}

// Helper to convert JSON to SitterAvailability
export const jsonToAvailability = (weeklySchedule: Json, overrides: Json): SitterAvailability => {
  const schedule = weeklySchedule as Record<string, unknown> || {};
  const parsedSchedule: Record<string, unknown[]> = {};
  
  for (const key in schedule) {
    if (Array.isArray(schedule[key])) {
      parsedSchedule[key] = schedule[key] as unknown[];
    } else {
      parsedSchedule[key] = [];
    }
  }
  
  return {
    weeklySchedule: parsedSchedule as unknown as SitterAvailability["weeklySchedule"],
    overrides: (Array.isArray(overrides) ? overrides : []) as unknown as SitterAvailability["overrides"],
    bookings: [],
  };
};

export const useSitterProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sitterProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("sitter_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as SitterProfile | null;
    },
    enabled: !!user,
  });
};

export const useCreateSitterProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: SitterProfileData) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("sitter_profiles")
        .insert({
          user_id: user.id,
          first_name: profile.firstName,
          last_name: profile.lastName,
          email: profile.email,
          phone: profile.phone || null,
          bio: profile.bio || null,
          experience: profile.experience || null,
          hourly_rate: profile.hourlyRate ? parseFloat(profile.hourlyRate) : null,
          services: profile.services,
          accepted_pet_types: profile.acceptedPetTypes,
          accepted_pet_sizes: profile.acceptedPetSizes,
          town: profile.town,
          address: profile.address || null,
          photos: profile.photos,
          weekly_schedule: profile.availability.weeklySchedule as unknown as Json,
          availability_overrides: profile.availability.overrides as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sitterProfile"] });
    },
  });
};

export const useUpdateSitterProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<SitterProfileData>) => {
      if (!user) throw new Error("Must be logged in");

      const updateData: Record<string, unknown> = {};

      if (profile.firstName !== undefined) updateData.first_name = profile.firstName;
      if (profile.lastName !== undefined) updateData.last_name = profile.lastName;
      if (profile.email !== undefined) updateData.email = profile.email;
      if (profile.phone !== undefined) updateData.phone = profile.phone || null;
      if (profile.bio !== undefined) updateData.bio = profile.bio || null;
      if (profile.experience !== undefined) updateData.experience = profile.experience || null;
      if (profile.hourlyRate !== undefined) updateData.hourly_rate = profile.hourlyRate ? parseFloat(profile.hourlyRate) : null;
      if (profile.services !== undefined) updateData.services = profile.services;
      if (profile.acceptedPetTypes !== undefined) updateData.accepted_pet_types = profile.acceptedPetTypes;
      if (profile.acceptedPetSizes !== undefined) updateData.accepted_pet_sizes = profile.acceptedPetSizes;
      if (profile.town !== undefined) updateData.town = profile.town;
      if (profile.address !== undefined) updateData.address = profile.address || null;
      if (profile.photos !== undefined) updateData.photos = profile.photos;
      if (profile.availability !== undefined) {
        updateData.weekly_schedule = profile.availability.weeklySchedule as unknown as Json;
        updateData.availability_overrides = profile.availability.overrides as unknown as Json;
      }

      const { data, error } = await supabase
        .from("sitter_profiles")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sitterProfile"] });
    },
  });
};

// Interface for public sitter profile data (excludes PII like email, phone, address)
export interface PublicSitterProfile {
  id: string;
  user_id: string;
  status: "pending_approval" | "active" | "rejected" | "suspended";
  first_name: string;
  last_name: string;
  bio: string | null;
  experience: string | null;
  hourly_rate: number | null;
  services: string[];
  accepted_pet_types: string[];
  accepted_pet_sizes: string[];
  town: string;
  photos: string[];
  weekly_schedule: Json;
  availability_overrides: Json;
  approximate_latitude: number | null;
  approximate_longitude: number | null;
  created_at: string;
  updated_at: string;
}

// Hook to fetch contact info for authorized users only
export const useSitterContactInfo = (sitterId: string | null) => {
  return useQuery({
    queryKey: ["sitterContactInfo", sitterId],
    queryFn: async () => {
      if (!sitterId) return null;
      
      const { data, error } = await supabase
        .rpc("get_sitter_contact_info", { sitter_profile_id: sitterId });
      
      if (error) {
        console.error("Error fetching sitter contact info:", error);
        return null;
      }
      
      // RPC returns an array, get first result if exists
      return data && data.length > 0 ? data[0] as { email: string; phone: string | null; address: string | null } : null;
    },
    enabled: !!sitterId,
  });
};

export const useActiveSitters = (filters?: {
  petTypes?: string[];
  petSizes?: string[];
  towns?: string[];
  services?: string[];
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
}) => {
  return useQuery({
    queryKey: ["activeSitters", filters],
    queryFn: async () => {
      // Use the public view that excludes PII (email, phone, address)
      const { data, error } = await supabase
        .from("sitter_profiles_public")
        .select("*");

      // Note: Array filtering with overlaps would need to be done client-side
      // or with a custom function since Supabase JS client doesn't support 'overlaps' well
      if (error) throw error;

      let sitters = data as PublicSitterProfile[];

      // Client-side filtering for array overlaps
      if (filters?.petTypes && filters.petTypes.length > 0) {
        sitters = sitters.filter(s => 
          s.accepted_pet_types.some(t => filters.petTypes!.includes(t))
        );
      }

      if (filters?.petSizes && filters.petSizes.length > 0) {
        sitters = sitters.filter(s => 
          s.accepted_pet_sizes.some(t => filters.petSizes!.includes(t))
        );
      }

      if (filters?.towns && filters.towns.length > 0) {
        sitters = sitters.filter(s => filters.towns!.includes(s.town));
      }

      if (filters?.services && filters.services.length > 0) {
        sitters = sitters.filter(s => 
          s.services.some(service => {
            const normalizedService = service.toLowerCase().replace(/\s+/g, "-");
            return filters.services!.includes(normalizedService);
          })
        );
      }

      // Availability date/time filtering
      if (filters?.startDate) {
        sitters = sitters.filter(sitter => {
          // Convert JSON to SitterAvailability
          const availability = jsonToAvailability(
            sitter.weekly_schedule,
            sitter.availability_overrides
          );

          // If we have a date range (startDate to endDate), check all days
          if (filters.endDate) {
            const dates = eachDayOfInterval({
              start: filters.startDate!,
              end: filters.endDate
            });

            // Sitter must be available on ALL days in the range
            return dates.every(date => {
              if (filters.startTime && filters.endTime) {
                // Check specific time range availability
                return isSitterAvailable(date, filters.startTime, filters.endTime, availability);
              } else {
                // Just check if they have any availability on that date
                return hasAvailabilityOnDate(date, availability);
              }
            });
          } else {
            // Single date check
            if (filters.startTime && filters.endTime) {
              return isSitterAvailable(filters.startDate!, filters.startTime, filters.endTime, availability);
            } else {
              return hasAvailabilityOnDate(filters.startDate!, availability);
            }
          }
        });
      }

      return sitters;
    },
  });
};
