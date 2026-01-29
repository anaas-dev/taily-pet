import { Star, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const petSitters = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    reviews: 127,
    location: "Nicosia, Cyprus",
    services: ["Dog Walking", "Pet Sitting"],
    price: 25,
    verified: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    reviews: 89,
    location: "Limassol, Cyprus",
    services: ["Pet Sitting", "Grooming"],
    price: 30,
    verified: true,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    rating: 5.0,
    reviews: 64,
    location: "Larnaca, Cyprus",
    services: ["Dog Walking", "Training"],
    price: 35,
    verified: true,
  },
  {
    id: 4,
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    rating: 4.7,
    reviews: 103,
    location: "Paphos, Cyprus",
    services: ["Pet Sitting", "Dog Walking"],
    price: 22,
    verified: true,
  },
];

const FeaturedPetSitters = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Featured <span className="text-gradient">Pet Sitters</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Top-rated pet sitters in your area
            </p>
          </div>
          <Button variant="outline" className="w-fit">
            View All Pet Sitters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {petSitters.map((sitter, index) => (
            <div
              key={sitter.id}
              className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Avatar & Verified Badge */}
              <div className="relative p-6 pb-0">
                <img
                  src={sitter.avatar}
                  alt={sitter.name}
                  className="w-24 h-24 mx-auto rounded-full object-cover ring-4 ring-secondary"
                />
                {sitter.verified && (
                  <div className="absolute top-6 right-6 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6 text-center">
                <h3 className="font-bold text-lg mb-1">{sitter.name}</h3>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-3">
                  <MapPin className="w-3 h-3" />
                  {sitter.location}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-bold">{sitter.rating}</span>
                  <span className="text-muted-foreground text-sm">
                    ({sitter.reviews} reviews)
                  </span>
                </div>

                {/* Services */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {sitter.services.map((service) => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      €{sitter.price}
                    </span>
                    <span className="text-muted-foreground text-sm">/hr</span>
                  </div>
                  <Button size="sm">Book Now</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPetSitters;
