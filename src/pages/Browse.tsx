import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { SearchFilters } from "@/lib/filterData";
import { useActiveSitters, PublicSitterProfile } from "@/hooks/useSitterProfile";
import { Skeleton } from "@/components/ui/skeleton";
import SidebarFilters from "@/components/browse/SidebarFilters";
import SitterCard from "@/components/browse/SitterCard";
import SitterMap from "@/components/browse/SitterMap";
import { List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Browse = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Parse URL params for initial filter state
  const getInitialFilters = (): SearchFilters => {
    const petTypes =
      searchParams.get("petTypes")?.split(",").filter(Boolean) || [];
    const towns = searchParams.get("towns")?.split(",").filter(Boolean) || [];
    const petSizes =
      searchParams.get("petSizes")?.split(",").filter(Boolean) || [];
    const services =
      searchParams.get("services")?.split(",").filter(Boolean) || [];

    return { petTypes, towns, petSizes, services };
  };

  const [filters, setFilters] = useState<SearchFilters>(getInitialFilters);
  const [hoveredSitterId, setHoveredSitterId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(!isMobile);

  // Use the database-driven hook with current filters
  const { data: sitters = [], isLoading } = useActiveSitters({
    petTypes: filters.petTypes.length > 0 ? filters.petTypes : undefined,
    towns: filters.towns.length > 0 ? filters.towns : undefined,
    petSizes: filters.petSizes.length > 0 ? filters.petSizes : undefined,
    services: filters.services.length > 0 ? filters.services : undefined,
    startDate: filters.startDate,
    endDate: filters.endDate,
    startTime: filters.startTime,
    endTime: filters.endTime,
  });

  const handleMessage = (sitterUserId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/messages?with=${sitterUserId}`);
  };

  const handleViewProfile = (sitterId: string) => {
    navigate(`/sitter/${sitterId}`);
  };

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex">
        {/* Left Sidebar - Filters */}
        <aside className="hidden lg:block w-80 flex-shrink-0 border-r border-border bg-background">
          <div className="sticky top-0 h-screen overflow-hidden">
            <div className="p-4 border-b border-border bg-primary/5">
              <h1 className="text-xl font-bold text-foreground">
                Find Pet Sitters
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading
                  ? "Searching..."
                  : `${sitters.length} sitter${sitters.length !== 1 ? "s" : ""} found`}
              </p>
            </div>
            <SidebarFilters
              onSearch={handleSearch}
              initialFilters={filters}
              className="border-0 rounded-none"
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header with Toggle */}
          <div className="lg:hidden p-4 border-b border-border bg-background">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Find Pet Sitters
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading
                    ? "Searching..."
                    : `${sitters.length} sitter${sitters.length !== 1 ? "s" : ""} found`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? (
                  <>
                    <List className="w-4 h-4 mr-2" />
                    List
                  </>
                ) : (
                  <>
                    <Map className="w-4 h-4 mr-2" />
                    Map
                  </>
                )}
              </Button>
            </div>
            {/* Mobile Filters - Collapsed */}
            <SidebarFilters
              onSearch={handleSearch}
              initialFilters={filters}
              className="lg:hidden"
            />
          </div>

          {/* Results + Map Grid */}
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Results List */}
            <div
              className={`${
                showMap ? "hidden lg:block" : "block"
              } lg:w-1/2 xl:w-2/5 overflow-y-auto border-r border-border`}
            >
              <div className="p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-card rounded-lg border border-border p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          <Skeleton className="h-8 w-10" />
                          <Skeleton className="h-8 flex-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sitters.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      No pet sitters found matching your criteria.
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Try adjusting your filters to see more results.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sitters.map((sitter) => (
                      <SitterCard
                        key={sitter.id}
                        sitter={sitter}
                        selectedDate={filters.startDate}
                        onMessage={handleMessage}
                        onViewProfile={handleViewProfile}
                        isHovered={hoveredSitterId === sitter.id}
                        onHover={setHoveredSitterId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Map View */}
            <div
              className={`${
                showMap ? "block" : "hidden lg:block"
              } lg:flex-1 h-[calc(100vh-200px)] lg:h-auto lg:sticky lg:top-0`}
            >
              <SitterMap
                sitters={sitters}
                hoveredSitterId={hoveredSitterId}
                onSitterHover={setHoveredSitterId}
                className="h-full"
              />
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Browse;
