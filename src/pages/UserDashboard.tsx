import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, MessageSquare, User, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ReviewForm } from "@/components/reviews/ReviewForm";

interface Booking {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  has_review?: boolean;
  sitter: {
    id: string;
    first_name: string;
    last_name: string;
    town: string;
    hourly_rate: number | null;
  };
}

const UserDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

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
          sitter_id
        `)
        .eq("owner_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
        setIsLoading(false);
        return;
      }

      // Fetch sitter details and check for existing reviews
      const bookingsWithSitters = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: sitterData } = await supabase
            .from("sitter_profiles")
            .select("id, first_name, last_name, town, hourly_rate")
            .eq("id", booking.sitter_id)
            .single();

          // Check if this booking has a review
          const { data: reviewData } = await supabase
            .from("reviews")
            .select("id")
            .eq("booking_id", booking.id)
            .maybeSingle();

          return {
            ...booking,
            has_review: !!reviewData,
            sitter: sitterData || {
              id: booking.sitter_id,
              first_name: "Unknown",
              last_name: "Sitter",
              town: "",
              hourly_rate: null,
            },
          };
        })
      );

      setBookings(bookingsWithSitters);
      setIsLoading(false);
    };

    fetchBookings();
  }, [user]);

  const handleLeaveReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewDialogOpen(true);
  };

  const handleReviewSuccess = () => {
    setReviewDialogOpen(false);
    setSelectedBooking(null);
    // Update the booking to show it has a review
    if (selectedBooking) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id ? { ...b, has_review: true } : b
        )
      );
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to cancel booking");
      return;
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );
    toast.success("Booking cancelled");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      cancelled: "destructive",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const filterBookings = (status?: string) => {
    if (!status || status === "all") return bookings;
    return bookings.filter((b) => b.status === status);
  };

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.date) >= new Date() && b.status !== "cancelled"
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.date) < new Date() || b.status === "cancelled"
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground mb-8">
            Manage your bookings and pet care requests
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{bookings.length}</p>
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
          </div>

          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No upcoming bookings</p>
                    <Button
                      onClick={() => navigate("/browse")}
                      className="mt-4"
                    >
                      Find a Pet Sitter
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={handleCancelBooking}
                    onMessage={() => navigate("/messages")}
                    onViewSitter={() => navigate(`/sitter/${booking.sitter.id}`)}
                    onLeaveReview={() => handleLeaveReview(booking)}
                    getStatusBadge={getStatusBadge}
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
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={handleCancelBooking}
                    onMessage={() => navigate("/messages")}
                    onViewSitter={() => navigate(`/sitter/${booking.sitter.id}`)}
                    onLeaveReview={() => handleLeaveReview(booking)}
                    getStatusBadge={getStatusBadge}
                    isPast
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No bookings yet</p>
                    <Button
                      onClick={() => navigate("/browse")}
                      className="mt-4"
                    >
                      Find a Pet Sitter
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={handleCancelBooking}
                    onMessage={() => navigate("/messages")}
                    onViewSitter={() => navigate(`/sitter/${booking.sitter.id}`)}
                    onLeaveReview={() => handleLeaveReview(booking)}
                    getStatusBadge={getStatusBadge}
                    isPast={new Date(booking.date) < new Date()}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedBooking && (
            <ReviewForm
              bookingId={selectedBooking.id}
              sitterId={selectedBooking.sitter.id}
              sitterName={`${selectedBooking.sitter.first_name} ${selectedBooking.sitter.last_name}`}
              onSuccess={handleReviewSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  onMessage: () => void;
  onViewSitter: () => void;
  onLeaveReview: () => void;
  getStatusBadge: (status: string) => JSX.Element;
  isPast?: boolean;
}

const BookingCard = ({
  booking,
  onCancel,
  onMessage,
  onViewSitter,
  onLeaveReview,
  getStatusBadge,
  isPast,
}: BookingCardProps) => {
  const canLeaveReview = booking.status === "completed" && !booking.has_review;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">
                {booking.sitter.first_name} {booking.sitter.last_name}
              </h3>
              {getStatusBadge(booking.status)}
              {booking.has_review && (
                <Badge variant="outline" className="text-primary border-primary">
                  <Star className="h-3 w-3 mr-1 fill-primary" />
                  Reviewed
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(booking.date), "PPP")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {booking.start_time} - {booking.end_time}
              </div>
              {booking.sitter.town && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {booking.sitter.town}
                </div>
              )}
            </div>

            {booking.notes && (
              <p className="text-sm text-muted-foreground">
                Notes: {booking.notes}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onViewSitter}>
              <User className="h-4 w-4 mr-1" />
              View Sitter
            </Button>
            <Button variant="outline" size="sm" onClick={onMessage}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
            {canLeaveReview && (
              <Button size="sm" onClick={onLeaveReview}>
                <Star className="h-4 w-4 mr-1" />
                Leave Review
              </Button>
            )}
            {!isPast && booking.status === "pending" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(booking.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDashboard;
