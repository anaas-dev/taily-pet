import { useState } from "react";
import { Search, CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { cyprusTowns, petTypes, petSizes, serviceTypes, SearchFilters } from "@/lib/filterData";
import { TIME_OPTIONS } from "@/lib/availability";
import MultiSelectFilter from "./MultiSelectFilter";

interface SearchFiltersPanelProps {
  onSearch: (filters: SearchFilters) => void;
  variant?: "hero" | "browse";
  className?: string;
}

const SearchFiltersPanel = ({
  onSearch,
  variant = "hero",
  className,
}: SearchFiltersPanelProps) => {
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>([]);
  const [selectedTowns, setSelectedTowns] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();

  const handleSearch = () => {
    onSearch({
      petTypes: selectedPetTypes,
      towns: selectedTowns,
      petSizes: selectedSizes,
      services: selectedServices,
      startDate,
      endDate,
      startTime,
      endTime,
    });
  };

  const townOptions = cyprusTowns.map((t) => ({
    value: t.toLowerCase(),
    label: t,
  }));

  const isHero = variant === "hero";

  return (
    <div className={cn(className)}>
      {isHero && (
        <h3 className="font-bold text-lg mb-4 text-white">Find a Pet Sitter</h3>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Pet Type - Multi Select */}
        <MultiSelectFilter
          label="Pet Type"
          placeholder="Select pets"
          options={petTypes}
          selected={selectedPetTypes}
          onSelectionChange={setSelectedPetTypes}
        />

        {/* Town - Multi Select */}
        <MultiSelectFilter
          label="Town"
          placeholder="Select towns"
          options={townOptions}
          selected={selectedTowns}
          onSelectionChange={setSelectedTowns}
        />

        {/* Pet Size - Multi Select */}
        <MultiSelectFilter
          label="Pet Size"
          placeholder="Select sizes"
          options={petSizes}
          selected={selectedSizes}
          onSelectionChange={setSelectedSizes}
        />

        {/* Service Type - Multi Select */}
        <MultiSelectFilter
          label="Service"
          placeholder="Select services"
          options={serviceTypes}
          selected={selectedServices}
          onSelectionChange={setSelectedServices}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {/* Start Date & Time */}
        <div className="space-y-2">
          <label className={cn(
            "text-sm font-medium",
            isHero ? "text-white/80" : "text-foreground"
          )}>Start Date</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal bg-background",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PP") : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <label className={cn(
            "text-sm font-medium",
            isHero ? "text-white/80" : "text-foreground"
          )}>Start Time</label>
          <Select value={startTime} onValueChange={setStartTime}>
            <SelectTrigger className="bg-background">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.filter((_, i) => i % 2 === 0).map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* End Date & Time */}
        <div className="space-y-2">
          <label className={cn(
            "text-sm font-medium",
            isHero ? "text-white/80" : "text-foreground"
          )}>End Time</label>
          <Select value={endTime} onValueChange={setEndTime}>
            <SelectTrigger className="bg-background">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.filter((_, i) => i % 2 === 0).map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* End Date (for multi-day bookings) */}
      {variant === "browse" && (
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Multi-day booking?</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal bg-background",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PP") : "End date (optional)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="pointer-events-auto"
                disabled={(date) => date < (startDate || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <Button
        size="lg"
        className="w-full sm:w-auto mt-6 gap-2"
        onClick={handleSearch}
      >
        <Search className="w-5 h-5" />
        Search Pet Sitters
      </Button>
    </div>
  );
};

export default SearchFiltersPanel;
