import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, hsl(38 92% 50%), hsl(25 80% 55%))",
        }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      <div className="relative container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 max-w-3xl mx-auto leading-tight">
          Ready to Give Your Pet the Care They Deserve?
        </h2>

        <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Sign up today and find the perfect pet sitter for your furry friend.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 gap-2 text-base shadow-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 hover:text-white gap-2 text-base"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
