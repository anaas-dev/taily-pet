import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MessageSquare, User, Check, X, CheckCircle2 } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";

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

interface BookingRequestCardProps {
  booking: BookingRequest;
  onAccept?: () => void;
  onDecline?: () => void;
  onComplete?: () => void;
  onMessage: () => void;
  showActions?: boolean;
  showCompleteAction?: boolean;
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { variant: "secondary", label: "Pending" },
    confirmed: { variant: "default", label: "Confirmed" },
    declined: { variant: "destructive", label: "Declined" },
    cancelled: { variant: "outline", label: "Cancelled" },
    completed: { variant: "outline", label: "Completed" },
  };
  const { variant, label } = config[status] || { variant: "secondary", label: status };
  return <Badge variant={variant}>{label}</Badge>;
};

const BookingRequestCard = ({
  booking,
  onAccept,
  onDecline,
  onComplete,
  onMessage,
  showActions,
  showCompleteAction,
}: BookingRequestCardProps) => {
  const ownerName = booking.owner
    ? `${booking.owner.first_name || ""} ${booking.owner.last_name || ""}`.trim() || "Pet Owner"
    : "Pet Owner";

  const bookingDate = parseISO(booking.date);
  const isInPast = isPast(bookingDate);
  const canComplete = booking.status === "confirmed" && isInPast;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">{ownerName}</h3>
              </div>
              {getStatusBadge(booking.status)}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(bookingDate, "PPP")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {booking.start_time} - {booking.end_time}
              </div>
            </div>

            {booking.notes && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="font-medium text-xs text-muted-foreground mb-1">Notes from owner:</p>
                <p>{booking.notes}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Requested on {format(parseISO(booking.created_at), "PPP 'at' p")}
            </p>
          </div>

          <div className="flex flex-col gap-2 min-w-[140px]">
            {showActions && onAccept && onDecline && (
              <>
                <Button onClick={onAccept} size="sm" className="w-full">
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button onClick={onDecline} variant="outline" size="sm" className="w-full">
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </>
            )}
            {(showCompleteAction || canComplete) && onComplete && (
              <Button onClick={onComplete} variant="secondary" size="sm" className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onMessage} className="w-full">
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingRequestCard;
