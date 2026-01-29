import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSitterRole } from "@/hooks/useSitterRole";
import { useSitterProfile } from "@/hooks/useSitterProfile";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Settings, User, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BookingRequestCard from "@/components/sitter-dashboard/BookingRequestCard";
import ProfileEditor from "@/components/sitter-dashboard/ProfileEditor";
import AvailabilityManager from "@/components/sitter-dashboard/AvailabilityManager";
import EarningsOverview from "@/components/sitter-dashboard/EarningsOverview";

interface BookingRequest {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  owner_id: string;
  owner: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

const SitterDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isApprovedSitter, sitterProfileId, loading: sitterLoading } = useSitterRole();
  const { data: sitterProfile, refetch: refetchProfile, isLoading: profileLoading } = useSitterProfile();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!sitterLoading && !isApprovedSitter && user) {
      toast.error("You need to be an approved sitter to access this page");
      navigate("/");
    }
  }, [isApprovedSitter, sitterLoading, user, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!sitterProfileId) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          date,
          start_time,
          end_time,
          status,
          notes,
          created_at,
          owner_id
        `)
        .eq("sitter_id", sitterProfileId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load booking requests");
        setIsLoading(false);
        return;
      }

      // Fetch owner details for each booking
      const bookingsWithOwners = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("first_name, last_name, email")
            .eq("user_id", booking.owner_id)
            .single();

          return {
            ...booking,
            owner: profileData,
          };
        })
      );

      setBookings(bookingsWithOwners);
      setIsLoading(false);
    };

    if (sitterProfileId) {
      fetchBookings();
    }
  }, [sitterProfileId]);

  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: "confirmed" | "declined" | "completed"
  ) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      const action =
        newStatus === "confirmed"
          ? "accept"
          : newStatus === "declined"
          ? "decline"
          : "complete";
      toast.error(`Failed to ${action} booking`);
      return;
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );

    const message =
      newStatus === "confirmed"
        ? "Booking accepted"
        : newStatus === "declined"
        ? "Booking declined"
        : "Booking marked as completed";
    toast.success(message);
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.date) >= new Date() && b.status === "confirmed"
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.date) < new Date() || ["declined", "cancelled", "completed"].includes(b.status)
  );

  if (authLoading || sitterLoading || isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isApprovedSitter || !sitterProfile) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Sitter Dashboard</h1>
          <p className="text-muted-foreground mb-8">
            Manage your bookings, availability, and profile
          </p>

          {pendingBookings.length > 0 && (
            <Alert className="mb-6 border-primary/50 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                You have {pendingBookings.length} pending booking request
                {pendingBookings.length > 1 ? "s" : ""} awaiting your response.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="h-4 w-4 hidden sm:block" />
                Bookings
                {pendingBookings.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                    {pendingBookings.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="availability" className="gap-2">
                <Clock className="h-4 w-4 hidden sm:block" />
                Availability
              </TabsTrigger>
              <TabsTrigger value="earnings" className="gap-2">
                <TrendingUp className="h-4 w-4 hidden sm:block" />
                Earnings
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <Settings className="h-4 w-4 hidden sm:block" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{pendingBookings.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Upcoming
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {bookings.filter((b) => b.status === "completed").length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Tabs */}
              <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="pending" className="relative">
                    Pending
                    {pendingBookings.length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                        {pendingBookings.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {pendingBookings.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">No pending requests</p>
                      </CardContent>
                    </Card>
                  ) : (
                    pendingBookings.map((booking) => (
                      <BookingRequestCard
                        key={booking.id}
                        booking={booking}
                        onAccept={() => handleUpdateBookingStatus(booking.id, "confirmed")}
                        onDecline={() => handleUpdateBookingStatus(booking.id, "declined")}
                        onMessage={() => navigate("/messages")}
                        showActions
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingBookings.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">No upcoming bookings</p>
                      </CardContent>
                    </Card>
                  ) : (
                    upcomingBookings.map((booking) => (
                      <BookingRequestCard
                        key={booking.id}
                        booking={booking}
                        onComplete={() => handleUpdateBookingStatus(booking.id, "completed")}
                        onMessage={() => navigate("/messages")}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                  {pastBookings.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">No past bookings</p>
                      </CardContent>
                    </Card>
                  ) : (
                    pastBookings.map((booking) => (
                      <BookingRequestCard
                        key={booking.id}
                        booking={booking}
                        onComplete={
                          booking.status === "confirmed"
                            ? () => handleUpdateBookingStatus(booking.id, "completed")
                            : undefined
                        }
                        onMessage={() => navigate("/messages")}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  {bookings.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">No booking requests yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    bookings.map((booking) => (
                      <BookingRequestCard
                        key={booking.id}
                        booking={booking}
                        onAccept={
                          booking.status === "pending"
                            ? () => handleUpdateBookingStatus(booking.id, "confirmed")
                            : undefined
                        }
                        onDecline={
                          booking.status === "pending"
                            ? () => handleUpdateBookingStatus(booking.id, "declined")
                            : undefined
                        }
                        onComplete={
                          booking.status === "confirmed"
                            ? () => handleUpdateBookingStatus(booking.id, "completed")
                            : undefined
                        }
                        onMessage={() => navigate("/messages")}
                        showActions={booking.status === "pending"}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="availability">
              <AvailabilityManager
                profile={sitterProfile}
                onUpdate={() => refetchProfile()}
              />
            </TabsContent>

            <TabsContent value="earnings">
              <EarningsOverview
                bookings={bookings}
                hourlyRate={sitterProfile.hourly_rate}
              />
            </TabsContent>

            <TabsContent value="profile">
              <ProfileEditor
                profile={sitterProfile}
                onUpdate={() => refetchProfile()}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SitterDashboard;
