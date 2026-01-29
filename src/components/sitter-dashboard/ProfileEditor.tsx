import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SitterProfile, useUpdateSitterProfile } from "@/hooks/useSitterProfile";
import { towns, petTypes, petSizes, serviceTypes } from "@/lib/filterData";

interface ProfileEditorProps {
  profile: SitterProfile;
  onUpdate: () => void;
}

const ProfileEditor = ({ profile, onUpdate }: ProfileEditorProps) => {
  const updateProfile = useUpdateSitterProfile();
  
  const [formData, setFormData] = useState({
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    phone: profile.phone || "",
    bio: profile.bio || "",
    experience: profile.experience || "",
    hourlyRate: profile.hourly_rate?.toString() || "",
    town: profile.town,
    address: profile.address || "",
    services: profile.services || [],
    acceptedPetTypes: profile.accepted_pet_types || [],
    acceptedPetSizes: profile.accepted_pet_sizes || [],
  });

  useEffect(() => {
    setFormData({
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      phone: profile.phone || "",
      bio: profile.bio || "",
      experience: profile.experience || "",
      hourlyRate: profile.hourly_rate?.toString() || "",
      town: profile.town,
      address: profile.address || "",
      services: profile.services || [],
      acceptedPetTypes: profile.accepted_pet_types || [],
      acceptedPetSizes: profile.accepted_pet_sizes || [],
    });
  }, [profile]);

  const handleArrayToggle = (
    field: "services" | "acceptedPetTypes" | "acceptedPetSizes",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      toast.success("Profile updated successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your basic profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell pet owners about yourself..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              rows={3}
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Describe your experience with pets..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="town">Town</Label>
              <Select
                value={formData.town}
                onValueChange={(value) => setFormData({ ...formData, town: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select town" />
                </SelectTrigger>
                <SelectContent>
                  {towns.map((town) => (
                    <SelectItem key={town.value} value={town.label}>
                      {town.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services Offered</CardTitle>
          <CardDescription>Select the services you provide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {serviceTypes.map((service) => (
              <div key={service.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`service-${service.value}`}
                  checked={formData.services.some(
                    (s) => s.toLowerCase().replace(/\s+/g, "-") === service.value
                  )}
                  onCheckedChange={() => handleArrayToggle("services", service.label)}
                />
                <Label htmlFor={`service-${service.value}`} className="text-sm font-normal">
                  {service.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pets Accepted</CardTitle>
          <CardDescription>Specify which pets you can care for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-3 block">Pet Types</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {petTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={formData.acceptedPetTypes.includes(type.label)}
                    onCheckedChange={() => handleArrayToggle("acceptedPetTypes", type.label)}
                  />
                  <Label htmlFor={`type-${type.value}`} className="text-sm font-normal">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Pet Sizes</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {petSizes.map((size) => (
                <div key={size.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size.value}`}
                    checked={formData.acceptedPetSizes.includes(size.label)}
                    onCheckedChange={() => handleArrayToggle("acceptedPetSizes", size.label)}
                  />
                  <Label htmlFor={`size-${size.value}`} className="text-sm font-normal">
                    {size.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileEditor;
