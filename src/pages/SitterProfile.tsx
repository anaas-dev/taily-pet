import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Check, MessageCircle, Clock, Calendar, ArrowLeft, Lock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { SitterRatingBadge } from "@/components/reviews/SitterRatingBadge";
import { useSitterContactInfo } from "@/hooks/useSitterProfile";

// Public sitter profile interface (excludes PII)
interface PublicSitterProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  experience: string | null;
  hourly_rate: number | null;
  services: string[] | null;
  accepted_pet_types: string[] | null;
  accepted_pet_sizes: string[] | null;
  town: string;
  photos: string[] | null;
  status: string;
}

// Mock data for demo purposes (will be replaced with real data)
const mockSitter = {
  id: "1",
  user_id: "mock-user-1",
  first_name: "Maria",
  last_name: "Georgiou",
  bio: "I'm a passionate animal lover with over 5 years of experience caring for pets of all kinds. I treat every pet as if they were my own family member. My home has a large, secure garden perfect for dogs to play in.",
  experience: "5+ years of professional pet sitting experience. Previously worked at a veterinary clinic for 2 years. Certified in pet first aid.",
  hourly_rate: 25,
  services: ["Dog Walking", "Pet Sitting", "Overnight Care"],
  accepted_pet_types: ["dog", "cat"],
  accepted_pet_sizes: ["small", "medium", "large"],
  town: "Nicosia",
  photos: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"],
  status: "active",
  rating: 4.9,
  reviews: 127,
};

const petTypeLabels: Record<string, string> = {
  dog: "Dogs",
  cat: "Cats",
  bird: "Birds",
  rabbit: "Rabbits",
  other: "Other Pets",
};

const petSizeLabels: Record<string, string> = {
  small: "Small (0-10kg)",
  medium: "Medium (10-25kg)",
  large: "Large (25-45kg)",
  giant: "Giant (45kg+)",
};

const SitterProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sitter, setSitter] = useState<PublicSitterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  
  // Fetch contact info securely (only available for authorized users)
  const { data: contactInfo } = useSitterContactInfo(sitter?.id ?? null);

  useEffect(() => {
    const fetchSitter = async () => {
      if (!id) return;

      try {
        // Fetch from the public view that excludes PII
        const { data, error } = await supabase
          .from("sitter_profiles_public")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          // Fall back to mock data for demo
          if (id === "1" || id === "2" || id === "3" || id === "4" || id === "5" || id === "6") {
            setSitter({ ...mockSitter, id });
          } else {
            toast.error("Sitter not found");
            navigate("/browse");
          }
        } else {
          setSitter(data);
        }
      } catch (error) {
        console.error("Error fetching sitter:", error);
        // Use mock data for demo
        setSitter({ ...mockSitter, id: id || "1" });
      } finally {
        setLoading(false);
      }
    };

    fetchSitter();
  }, [id, navigate]);

  const handleMessage = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (sitter) {
      navigate(`/messages?with=${sitter.user_id}`);
    }
  };

  const handleBook = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setBookingOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Sitter not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const fullName = `${sitter.first_name} ${sitter.last_name}`;
  const mainPhoto = sitter.photos?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/browse")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <Avatar className="w-32 h-32 mx-auto md:mx-0">
                      <AvatarImage src={mainPhoto} alt={fullName} />
                      <AvatarFallback className="text-3xl">
                        {sitter.first_name[0]}{sitter.last_name[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold">{fullName}</h1>
                        <div className="bg-primary/10 rounded-full p-1">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      </div>

                      <div className="flex items-center justify-center md:justify-start gap-1 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{sitter.town}</span>
                      </div>

                      <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                        <SitterRatingBadge sitterId={sitter.id} />
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {sitter.services?.map((service) => (
                          <Badge key={service} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {sitter.bio || "No bio provided yet."}
                  </p>
                </CardContent>
              </Card>

              {/* Experience Section */}
              {sitter.experience && (
                <Card>
                  <CardHeader>
                    <CardTitle>Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {sitter.experience}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Pets Accepted */}
              <Card>
                <CardHeader>
                  <CardTitle>Pets I Care For</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Pet Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {sitter.accepted_pet_types?.map((type) => (
                        <Badge key={type} variant="outline">
                          {petTypeLabels[type] || type}
                        </Badge>
                      )) || <span className="text-muted-foreground">Not specified</span>}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Pet Sizes</h4>
                    <div className="flex flex-wrap gap-2">
                      {sitter.accepted_pet_sizes?.map((size) => (
                        <Badge key={size} variant="outline">
                          {petSizeLabels[size] || size}
                        </Badge>
                      )) || <span className="text-muted-foreground">Not specified</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photo Gallery */}
              {sitter.photos && sitter.photos.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {sitter.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`${fullName} photo ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <ReviewsList sitterId={sitter.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-primary">
                      €{sitter.hourly_rate || 20}
                    </span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={handleBook}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={handleMessage}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Usually responds within 1 hour</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Verified profile</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info - Only shown to authorized users */}
              {contactInfo ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contactInfo.phone && (
                      <p className="text-muted-foreground">{contactInfo.phone}</p>
                    )}
                    {contactInfo.address && (
                      <p className="text-muted-foreground text-sm">{contactInfo.address}</p>
                    )}
                  </CardContent>
                </Card>
              ) : user ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Contact info is available after you book or message this sitter.
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Booking Dialog */}
      {sitter && (
        <BookingDialog
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          sitter={{
            id: sitter.id,
            first_name: sitter.first_name,
            last_name: sitter.last_name,
            hourly_rate: sitter.hourly_rate,
            email: contactInfo?.email || "",
          }}
        />
      )}
    </div>
  );
};

export default SitterProfilePage;