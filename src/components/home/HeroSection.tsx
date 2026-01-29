import { useNavigate } from "react-router-dom";
import heroPets from "@/assets/hero-pets-real.jpg";
import SearchFiltersPanel from "@/components/filters/SearchFiltersPanel";
import { SearchFilters } from "@/lib/filterData";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleSearch = (filters: SearchFilters) => {
    // Build query params from filters
    const params = new URLSearchParams();
    if (filters.petTypes.length > 0) params.set("petTypes", filters.petTypes.join(","));
    if (filters.towns.length > 0) params.set("towns", filters.towns.join(","));
    if (filters.petSizes.length > 0) params.set("petSizes", filters.petSizes.join(","));
    if (filters.services.length > 0) params.set("services", filters.services.join(","));
    if (filters.startDate) params.set("startDate", filters.startDate.toISOString());
    if (filters.endDate) params.set("endDate", filters.endDate.toISOString());

    navigate(`/browse?${params.toString()}`);
  };

  return (
    <section className="overflow-hidden">
      {/* Mobile Layout - Full image with text overlay on left, filters below */}
      <div className="md:hidden">
        {/* Image with text overlay on left side */}
        <div className="relative">
          <img
            src={heroPets}
            alt="Adorable dog and cat cuddling under a blanket"
            className="w-full h-auto"
          />
          {/* Gradient Overlay - only on left side to keep animals visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
          
          {/* Text Content - positioned on left */}
          <div className="absolute inset-0 flex flex-col justify-center p-6 max-w-[60%]">
            <h1
              className="text-xl font-extrabold leading-tight mb-2"
              style={{
                color: "white",
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
              }}
            >
              Loving Care for Your{" "}
              <span className="text-primary">Furry Family</span>
            </h1>
            <p
              className="text-xs leading-relaxed"
              style={{
                color: "rgba(255,255,255,0.9)",
                textShadow: "0 1px 8px rgba(0,0,0,0.4)",
              }}
            >
              Connect with trusted pet sitters in your neighborhood. Dog walking,
              pet sitting...
              <br />
              All the love your pet deserves.
            </p>
          </div>
        </div>
        
        {/* Filter Window - Below image on mobile */}
        <div className="bg-card px-6 pb-6 pt-4">
          <SearchFiltersPanel onSearch={handleSearch} variant="hero" />
        </div>
      </div>

      {/* Desktop Layout - Original overlay design */}
      <div className="hidden md:block relative min-h-[700px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroPets}
            alt="Adorable dog and cat cuddling under a blanket"
            className="w-full h-full object-cover object-[right_top]"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-md mb-8">
            <h1
              className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 animate-fade-in"
              style={{
                color: "white",
                textShadow: "0 2px 20px rgba(0,0,0,0.3)",
              }}
            >
              Loving Care for Your{" "}
              <span className="text-primary">Furry Family</span>
            </h1>

            <p
              className="text-lg mb-8 leading-relaxed animate-fade-in"
              style={{
                color: "rgba(255,255,255,0.9)",
                textShadow: "0 1px 10px rgba(0,0,0,0.3)",
                animationDelay: "0.1s",
              }}
            >
              Connect with trusted pet sitters in your neighborhood. Dog walking,
              pet sitting...
              <br />
              All the love your pet deserves.
            </p>
          </div>

          {/* Filter Window */}
          <div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-2xl animate-fade-in border border-white/20"
            style={{ animationDelay: "0.2s" }}
          >
            <SearchFiltersPanel onSearch={handleSearch} variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
