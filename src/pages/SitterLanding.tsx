import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Clock, 
  Gift, 
  Heart, 
  MapPin, 
  Sparkles, 
  PawPrint,
  Star,
  Zap,
  Trophy,
  Users
} from "lucide-react";
import heroPets from "@/assets/hero-pets-real.jpg";

const SitterLanding = () => {
  const founderPerks = [
    {
      icon: Trophy,
      title: "Founding Sitter Badge",
      description: "Stand out forever with an exclusive badge on your profile that shows you were here from day one.",
    },
    {
      icon: Star,
      title: "Priority Visibility",
      description: "Early sitters get top placement in search results when we launch to pet owners.",
    },
    {
      icon: Gift,
      title: "Shape the Platform",
      description: "Your feedback matters most. Help us build the features you actually need.",
    },
    {
      icon: Users,
      title: "First Access to Clients",
      description: "When pet owners join, you'll be the first they see. No competition... yet.",
    },
    {
      icon: MapPin,
      title: "Claim Your Area",
      description: "Be the go-to sitter in your neighborhood before anyone else signs up.",
    },
    {
      icon: Zap,
      title: "Zero Fees Forever",
      description: "Join now and lock in 0% platform fees. This won't last after launch.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Reserve Your Spot",
      description: "Create your profile in 5 minutes. Your spot is saved the moment you sign up.",
    },
    {
      number: "2",
      title: "Get Verified",
      description: "Our team personally reviews each founding sitter to ensure quality.",
    },
    {
      number: "3",
      title: "Be Ready for Launch",
      description: "When we go live with pet owners, you'll be first in line for bookings.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroPets}
            alt="Adorable pets"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/70" />
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center min-h-[90vh] text-center">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <span className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-primary">
              Taily
            </span>
            <span className="text-lg text-white/80">pet lovers</span>
          </div>

          {/* Launch Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold mb-8">
            <Sparkles className="w-4 h-4" />
            Launching Soon · Limited Founding Spots
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight mb-6 text-white max-w-4xl">
            Be the <span className="text-primary">First</span> Pet Sitter in Your Area
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl">
            Taily is launching soon.<br />
            Join now as a <strong>Founding Sitter</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button asChild size="lg" className="gap-2 text-lg px-8 shadow-lg">
              <Link to="/become-sitter">
                Claim Your Spot
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 text-lg bg-white/10 border-white/30 text-white hover:bg-white/20">
              <a href="#perks">
                See Founding Perks
              </a>
            </Button>
          </div>

          {/* Urgency stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50</div>
              <div className="text-sm text-white/70">Founding spots left</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0%</div>
              <div className="text-sm text-white/70">Fees for early sitters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">Soon™</div>
              <div className="text-sm text-white/70">Launch date</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Early Section */}
      <section className="py-16 md:py-24 bg-muted/30" id="perks">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              Exclusive Benefits
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Join Before Launch?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Early sitters get advantages that won't be available later.<br />
              Here's what you lock in by joining now.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {founderPerks.map((perk, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                    <perk.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{perk.title}</h3>
                  <p className="text-muted-foreground">{perk.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How to Become a Founding Sitter
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              It takes less than 5 minutes to secure your spot. Here's how it works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="gap-2">
              <Link to="/become-sitter">
                Reserve My Spot Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof / FOMO Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Clock className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Don't Wait Until Everyone Else Joins
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/become-sitter">
                  I Want Early Access
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, hsl(38 92% 50%), hsl(25 80% 55%))",
          }}
        />
        
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Heart className="w-4 h-4 fill-white" />
            Join the Founding Team
          </div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 max-w-3xl mx-auto leading-tight">
            Love Pets?<br />Be Part of Something New.
          </h2>
          
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            We're building the best platform for pet sitters.<br />
            Join us from the start and help shape the future of pet care.
          </p>

          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 text-lg px-8 shadow-lg">
            <Link to="/become-sitter">
              Become a Founding Sitter
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>

          <p className="text-white/70 text-sm mt-6">
            Free forever • No commitments • Limited founding spots
          </p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <PawPrint className="w-6 h-6 text-primary" />
              <span className="font-bold">Taily</span>
              <span className="text-muted-foreground text-sm">coming soon</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SitterLanding;