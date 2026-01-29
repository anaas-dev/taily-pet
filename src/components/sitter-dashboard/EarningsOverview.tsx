import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Euro, TrendingUp, Clock, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

interface Booking {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface EarningsOverviewProps {
  bookings: Booking[];
  hourlyRate: number | null;
}

const EarningsOverview = ({ bookings, hourlyRate }: EarningsOverviewProps) => {
  const rate = hourlyRate || 0;
  
  // Calculate hours for a booking
  const calculateHours = (startTime: string, endTime: string): number => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return (endMinutes - startMinutes) / 60;
  };

  // Get completed bookings
  const completedBookings = bookings.filter((b) => b.status === "completed");
  
  // Current month stats
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const thisMonthCompleted = completedBookings.filter((b) =>
    isWithinInterval(parseISO(b.date), { start: monthStart, end: monthEnd })
  );

  // Calculate earnings
  const thisMonthHours = thisMonthCompleted.reduce(
    (acc, b) => acc + calculateHours(b.start_time, b.end_time),
    0
  );
  const thisMonthEarnings = thisMonthHours * rate;

  const totalHours = completedBookings.reduce(
    (acc, b) => acc + calculateHours(b.start_time, b.end_time),
    0
  );
  const totalEarnings = totalHours * rate;

  // Upcoming confirmed bookings
  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && parseISO(b.date) >= now
  );
  const upcomingHours = upcomingBookings.reduce(
    (acc, b) => acc + calculateHours(b.start_time, b.end_time),
    0
  );
  const upcomingEarnings = upcomingHours * rate;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">€{thisMonthEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {thisMonthHours.toFixed(1)} hours • {thisMonthCompleted.length} bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">€{totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalHours.toFixed(1)} hours total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Earnings
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">€{upcomingEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingBookings.length} upcoming bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hourly Rate
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">€{rate.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">per hour</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Bookings</CardTitle>
          <CardDescription>
            Your completed pet sitting sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No completed bookings yet. Completed bookings will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {completedBookings.slice(0, 10).map((booking) => {
                const hours = calculateHours(booking.start_time, booking.end_time);
                const earnings = hours * rate;
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">
                        {format(parseISO(booking.date), "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.start_time} - {booking.end_time} ({hours.toFixed(1)} hours)
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      €{earnings.toFixed(2)}
                    </Badge>
                  </div>
                );
              })}
              {completedBookings.length > 10 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Showing 10 of {completedBookings.length} completed bookings
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsOverview;
