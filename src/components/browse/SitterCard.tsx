import { MapPin, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PublicSitterProfile, jsonToAvailability } from "@/hooks/useSitterProfile";
import AvailabilityIndicator from "./AvailabilityIndicator";
import { cn } from "@/lib/utils";

interface SitterCardProps {
  sitter: PublicSitterProfile;
  selectedDate?: Date;
  onMessage: (sitterUserId: string) => void;
  onViewProfile: (sitterId: string) => void;
  isHovered?: boolean;
  onHover?: (sitterId: string | null) => void;
}

const SitterCard = ({
  sitter,
  selectedDate,
  onMessage,
  onViewProfile,
  isHovered,
  onHover,
}: SitterCardProps) => {
  const fullName = `${sitter.first_name} ${sitter.last_name}`;
  const avatarSrc = sitter.photos?.[0] || undefined;
  const isVerified = sitter.status === "active";
  const availability = jsonToAvailability(
    sitter.weekly_schedule,
    sitter.availability_overrides
  );

  return (
    <div
      className={cn(
        "bg-card rounded-lg border transition-all duration-200 overflow-hidden",
        isHovered
          ? "border-primary shadow-md ring-2 ring-primary/20"
          : "border-border hover:shadow-md"
      )}
      onMouseEnter={() => onHover?.(sitter.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={avatarSrc} alt={fullName} />
            <AvatarFallback className="text-sm">
              {sitter.first_name[0]}
              {sitter.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {fullName}
              </h3>
              {isVerified && (
                <div className="bg-primary/10 rounded-full p-0.5 flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{sitter.town}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-lg font-bold text-primary">
              €{sitter.hourly_rate || 0}
            </span>
            <span className="text-xs text-muted-foreground">/hr</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {sitter.services?.slice(0, 3).map((service) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
          {(sitter.services?.length || 0) > 3 && (
            <Badge variant="outline" className="text-xs">
              +{sitter.services!.length - 3}
            </Badge>
          )}
        </div>

        <AvailabilityIndicator
          availability={availability}
          selectedDate={selectedDate}
          maxSlotsToShow={2}
        />

        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0"
            onClick={() => onMessage(sitter.user_id)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onViewProfile(sitter.id)}
          >
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SitterCard;
