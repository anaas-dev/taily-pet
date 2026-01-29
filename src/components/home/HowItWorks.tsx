import { Search, MessageCircle, Calendar, Heart } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse Pet Sitters",
    description: "Search for trusted pet sitters in your area based on services, ratings, and availability.",
  },
  {
    icon: MessageCircle,
    title: "Connect & Chat",
    description: "Message pet sitters directly to discuss your pet's needs and ask any questions.",
  },
  {
    icon: Calendar,
    title: "Book a Service",
    description: "Schedule dog walking, pet sitting, grooming, or other services with ease.",
  },
  {
    icon: Heart,
    title: "Happy Pets",
    description: "Your pets receive loving care while you have peace of mind.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="text-gradient">Taily</span> Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Finding the perfect care for your pet is simple and stress-free
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-border" />
              )}

              <div className="relative bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow text-center">
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>

                <div className="w-16 h-16 mx-auto mb-4 mt-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
