import { useState } from "react";
import { CalendarIcon, Clock, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  cyprusTowns,
  petTypes,
  petSizes,
  serviceTypes,
  SearchFilters,
} from "@/lib/filterData";
import { TIME_OPTIONS } from "@/lib/availability";
import MultiSelectFilter from "@/components/filters/MultiSelectFilter";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  className?: string;
}

const SidebarFilters = ({
  onSearch,
  initialFilters,
  className,
}: SidebarFiltersProps) => {
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>(
    initialFilters?.petTypes || []
  );
  const [selectedTowns, setSelectedTowns] = useState<string[]>(
    initialFilters?.towns || []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialFilters?.petSizes || []
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialFilters?.services || []
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialFilters?.startDate
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialFilters?.endDate
  );
  const [startTime, setStartTime] = useState<string | undefined>(
    initialFilters?.startTime
  );
  const [endTime, setEndTime] = useState<string | undefined>(
    initialFilters?.endTime
  );

  const townOptions = cyprusTowns.map((t) => ({
    value: t.toLowerCase(),
    label: t,
  }));

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

  const clearFilters = () => {
    setSelectedPetTypes([]);
    setSelectedTowns([]);
    setSelectedSizes([]);
    setSelectedServices([]);
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime(undefined);
    setEndTime(undefined);
    onSearch({
      petTypes: [],
      towns: [],
      petSizes: [],
      services: [],
    });
  };

  const hasActiveFilters =
    selectedPetTypes.length > 0 ||
    selectedTowns.length > 0 ||
    selectedSizes.length > 0 ||
    selectedServices.length > 0 ||
    startDate ||
    endDate;

  return (
    <div className={cn("bg-card border border-border rounded-lg", className)}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-foreground">Filters</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="p-4 space-y-6">
          {/* Pet Type */}
          <div className="space-y-2">
            <MultiSelectFilter
              label="Pet Type"
              placeholder="Select pets"
              options={petTypes}
              selected={selectedPetTypes}
              onSelectionChange={setSelectedPetTypes}
            />
          </div>

          {/* Town */}
          <div className="space-y-2">
            <MultiSelectFilter
              label="Location"
              placeholder="Select towns"
              options={townOptions}
              selected={selectedTowns}
              onSelectionChange={setSelectedTowns}
            />
          </div>

          {/* Pet Size */}
          <div className="space-y-2">
            <MultiSelectFilter
              label="Pet Size"
              placeholder="Select sizes"
              options={petSizes}
              selected={selectedSizes}
              onSelectionChange={setSelectedSizes}
            />
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <MultiSelectFilter
              label="Service"
              placeholder="Select services"
              options={serviceTypes}
              selected={selectedServices}
              onSelectionChange={setSelectedServices}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border pt-4">
            <h3 className="font-medium text-sm text-foreground mb-3">
              Availability
            </h3>

            {/* Start Date */}
            <div className="space-y-2 mb-3">
              <label className="text-sm text-muted-foreground">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2 mb-3">
              <label className="text-sm text-muted-foreground">
                End Date (optional)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date < (startDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">From</label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">To</label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
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
          </div>
        </div>
      </ScrollArea>

      {/* Search Button */}
      <div className="p-4 border-t border-border">
        <Button className="w-full gap-2" onClick={handleSearch}>
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>
    </div>
  );
};

export default SidebarFilters;
