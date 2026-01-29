import { Dog, Home, Scissors, GraduationCap, Stethoscope, Car } from "lucide-react";
import { toast } from "sonner";

const services = [
  {
    icon: Dog,
    title: "Dog Walking",
    description: "Regular walks to keep your pup happy and healthy",
    color: "bg-amber-100 text-amber-600",
    available: true,
  },
  {
    icon: Home,
    title: "Pet Sitting",
    description: "In-home care while you're away on trips",
    color: "bg-orange-100 text-orange-600",
    available: true,
  },
  {
    icon: Scissors,
    title: "Grooming",
    description: "Professional grooming services for all breeds",
    color: "bg-rose-100 text-rose-600",
    available: false,
  },
  {
    icon: GraduationCap,
    title: "Training",
    description: "Basic obedience and behavior training",
    color: "bg-blue-100 text-blue-600",
    available: false,
  },
  {
    icon: Stethoscope,
    title: "Vet Visits",
    description: "Transport and accompany pets to vet appointments",
    color: "bg-emerald-100 text-emerald-600",
    available: false,
  },
  {
    icon: Car,
    title: "Pet Taxi",
    description: "Safe transportation for your pets",
    color: "bg-violet-100 text-violet-600",
    available: false,
  },
];

const ServicesSection = () => {
  const handleServiceClick = (service: typeof services[0]) => {
    if (!service.available) {
      toast.info(`${service.title} is coming soon! We're working hard to bring this service online.`);
    }
  };

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Services for Every <span className="text-gradient">Pet Need</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From daily walks to overnight stays, we've got your pet covered
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`bg-card rounded-2xl p-6 text-center shadow-soft hover:shadow-card transition-shadow cursor-pointer group animate-fade-in ${!service.available ? 'opacity-75' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleServiceClick(service)}
            >
              <div
                className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${service.color} group-hover:scale-110 transition-transform`}
              >
                <service.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm mb-1">{service.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed hidden md:block">
                {service.description}
              </p>
              {!service.available && (
                <span className="text-xs text-primary font-medium mt-2 block">Coming Soon</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
