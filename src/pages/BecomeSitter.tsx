import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { PawPrint, MapPin, Clock, User, Briefcase, X, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { petTypes, petSizes, towns } from "@/lib/filterData";
import { cn } from "@/lib/utils";
import { 
  SitterAvailability, 
  createDefaultAvailability,
  DEFAULT_TIMEZONE 
} from "@/lib/availability";
import WeeklyScheduleEditor from "@/components/availability/WeeklyScheduleEditor";
import DateOverridesEditor from "@/components/availability/DateOverridesEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useSitterProfile, useCreateSitterProfile, useUpdateSitterProfile, SitterProfileData } from "@/hooks/useSitterProfile";

interface SitterProfile {
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

const serviceOptions = [
  { id: "dog-walking", label: "Dog Walking" },
  { id: "pet-sitting", label: "Pet Sitting" },
  { id: "overnight-care", label: "Overnight Care" },
  { id: "day-care", label: "Day Care" },
  { id: "grooming", label: "Grooming" },
  { id: "training", label: "Training" },
  { id: "vet-visits", label: "Vet Visits" },
  { id: "medication", label: "Medication Administration" },
];

const BecomeSitter = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading } = useAuth();
  const { data: existingProfile, isLoading: profileLoading } = useSitterProfile();
  const createProfile = useCreateSitterProfile();
  const updateProfile = useUpdateSitterProfile();
  
  const [profile, setProfile] = useState<SitterProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    experience: "",
    services: [],
    acceptedPetTypes: [],
    acceptedPetSizes: [],
    town: "",
    address: "",
    availability: createDefaultAvailability(),
    hourlyRate: "",
    photos: [],
  });

  // Load existing profile data if editing
  useEffect(() => {
    if (existingProfile) {
      setProfile({
        firstName: existingProfile.first_name,
        lastName: existingProfile.last_name,
        email: existingProfile.email,
        phone: existingProfile.phone || "",
        bio: existingProfile.bio || "",
        experience: existingProfile.experience || "",
        services: existingProfile.services || [],
        acceptedPetTypes: existingProfile.accepted_pet_types || [],
        acceptedPetSizes: existingProfile.accepted_pet_sizes || [],
        town: existingProfile.town,
        address: existingProfile.address || "",
        availability: {
          weeklySchedule: (existingProfile.weekly_schedule as unknown as SitterAvailability["weeklySchedule"]) || createDefaultAvailability().weeklySchedule,
          overrides: (existingProfile.availability_overrides as unknown as SitterAvailability["overrides"]) || [],
          bookings: [],
        },
        hourlyRate: existingProfile.hourly_rate?.toString() || "",
        photos: existingProfile.photos || [],
      });
    } else if (user) {
      // Pre-fill email from auth - ensure it's a string
      const userEmail = typeof user.email === 'string' ? user.email : "";
      setProfile(prev => ({
        ...prev,
        email: userEmail,
      }));
    }
  }, [existingProfile, user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxPhotos = 5;
    const remainingSlots = maxPhotos - profile.photos.length;
    
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload only image files");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfile((prev) => ({
          ...prev,
          photos: [...prev.photos, result],
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (field: keyof SitterProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "services" | "acceptedPetTypes" | "acceptedPetSizes", item: string) => {
    setProfile((prev) => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i) => i !== item)
        : [...currentArray, item];
      return { ...prev, [field]: newArray };
    });
  };

  const handleAvailabilityChange = (availability: SitterAvailability) => {
    setProfile((prev) => ({ ...prev, availability }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to create a sitter profile");
      navigate("/auth");
      return;
    }
    
    if (!profile.firstName || !profile.lastName || !profile.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (profile.acceptedPetTypes.length === 0) {
      toast.error("Please select at least one pet type you can care for");
      return;
    }
    
    if (profile.services.length === 0) {
      toast.error("Please select at least one service you offer");
      return;
    }
    
    if (!profile.town) {
      toast.error("Please select your location");
      return;
    }

    // Check if at least one day has availability set
    const hasWeeklyAvailability = Object.values(profile.availability.weeklySchedule).some(
      (slots) => slots.length > 0
    );
    
    if (!hasWeeklyAvailability) {
      toast.error("Please set your weekly availability for at least one day");
      return;
    }

    try {
      const profileData: SitterProfileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        experience: profile.experience,
        services: profile.services,
        acceptedPetTypes: profile.acceptedPetTypes,
        acceptedPetSizes: profile.acceptedPetSizes,
        town: profile.town,
        address: profile.address,
        availability: profile.availability,
        hourlyRate: profile.hourlyRate,
        photos: profile.photos,
      };

      if (existingProfile) {
        await updateProfile.mutateAsync(profileData);
        toast.success("Profile updated successfully!");
      } else {
        await createProfile.mutateAsync(profileData);
        toast.success("Profile submitted for approval! You'll be notified once approved.");
      }
      navigate("/");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save profile";
      toast.error(errorMessage);
    }
  };

  const isLoading = authLoading || profileLoading;
  const isSubmitting = createProfile.isPending || updateProfile.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign in or create an account to become a pet sitter.
            </p>
            <Button asChild>
              <Link to="/auth">Sign In / Sign Up</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {existingProfile ? "Edit Your" : "Become a"} <span className="text-gradient">Pet Sitter</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {existingProfile 
                ? "Update your profile information, services, and availability."
                : "Join our community of trusted pet care providers. Create your profile and start connecting with pet owners in your area."}
            </p>
            {existingProfile && (
              <Alert className="mt-4 max-w-lg mx-auto">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Status: <span className="font-semibold capitalize">{existingProfile.status.replace("_", " ")}</span>
                  {existingProfile.status === "pending_approval" && " - Your profile is awaiting admin approval."}
                </AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Timezone: {DEFAULT_TIMEZONE}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+357 99 000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">About You *</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell pet owners about yourself, your passion for animals, and why you'd be a great pet sitter..."
                    className="min-h-[120px]"
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-3">
                  <Label>Your Photos</Label>
                  <p className="text-sm text-muted-foreground">
                    Add up to 5 photos of yourself (first photo will be your profile picture)
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    {profile.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border"
                      >
                        <img
                          src={photo}
                          alt={`Profile photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                            Main
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {profile.photos.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus className="w-6 h-6" />
                        <span className="text-xs">Add Photo</span>
                      </button>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Experience
                </CardTitle>
                <CardDescription>Share your pet care background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Your Experience</Label>
                  <Textarea
                    id="experience"
                    value={profile.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    placeholder="Describe your experience with pets. Include any certifications, training, or special skills you have..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                    placeholder="15"
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Services Offered */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-primary" />
                  Services Offered *
                </CardTitle>
                <CardDescription>Select all services you can provide</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {serviceOptions.map((service) => (
                    <div
                      key={service.id}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-left",
                        profile.services.includes(service.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                      // onClick={() => toggleArrayItem("services", service.id)}
                    >
                      <Checkbox
                        checked={profile.services.includes(service.id)}
                        onCheckedChange={() => toggleArrayItem("services", service.id)}
                      />
                      <span className="text-sm font-medium">{service.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pet Types & Sizes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-primary" />
                  Pets You Can Care For *
                </CardTitle>
                <CardDescription>Select the types and sizes of pets you're comfortable with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Pet Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {petTypes.map((type) => (
                      <button
                        type="button"
                        key={type.value}
                        className={cn(
                          "inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
                          profile.acceptedPetTypes.includes(type.value)
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border text-foreground hover:bg-primary/10"
                        )}
                        onClick={() => toggleArrayItem("acceptedPetTypes", type.value)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Pet Sizes</Label>
                  <div className="flex flex-wrap gap-2">
                    {petSizes.map((size) => (
                      <button
                        type="button"
                        key={size.value}
                        className={cn(
                          "inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
                          profile.acceptedPetSizes.includes(size.value)
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border text-foreground hover:bg-primary/10"
                        )}
                        onClick={() => toggleArrayItem("acceptedPetSizes", size.value)}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location *
                </CardTitle>
                <CardDescription>Where are you based?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Town/Area</Label>
                  <div className="flex flex-wrap gap-2">
                    {towns.map((town) => (
                      <button
                        type="button"
                        key={town.value}
                        className={cn(
                          "inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
                          profile.town === town.value
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border text-foreground hover:bg-primary/10"
                        )}
                        onClick={() => handleInputChange("town", town.value)}
                      >
                        {town.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address (Optional)</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Availability *
                </CardTitle>
                <CardDescription>
                  Set your recurring weekly schedule and any date-specific changes. 
                  Confirmed bookings will automatically block those time slots.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <WeeklyScheduleEditor
                  schedule={profile.availability.weeklySchedule}
                  onChange={(weeklySchedule) =>
                    handleAvailabilityChange({
                      ...profile.availability,
                      weeklySchedule,
                    })
                  }
                />
                
                <DateOverridesEditor
                  overrides={profile.availability.overrides}
                  onChange={(overrides) =>
                    handleAvailabilityChange({
                      ...profile.availability,
                      overrides,
                    })
                  }
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-center">
              <Button type="submit" size="lg" className="px-12" disabled={isSubmitting}>
                {isSubmitting 
                  ? "Saving..." 
                  : existingProfile 
                    ? "Update Profile" 
                    : "Submit for Approval"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeSitter;
