import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Users, Shield, Star } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Taily
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Connecting pet lovers with trusted, caring pet sitters in your community.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="mb-4">
                Taily was born from a simple idea: every pet deserves exceptional care, and every pet owner deserves peace of mind. 
                We understand that your pets are family, and finding someone you can trust to care for them shouldn't be stressful.
              </p>
              <p className="mb-4">
                Our platform connects pet owners with verified, passionate pet sitters in their local community. 
                Whether you need someone to walk your dog, care for your cat while you're on vacation, or provide daily check-ins for your furry friend, 
                Taily makes it easy to find the perfect match.
              </p>
              <p>
                We're committed to building a community where pets receive the love and attention they deserve, 
                and pet owners can travel or work with confidence knowing their companions are in good hands.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Love for Pets</h3>
                <p className="text-muted-foreground">
                  Every pet sitter on our platform shares a genuine passion for animals.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Trust & Safety</h3>
                <p className="text-muted-foreground">
                  We verify all pet sitters to ensure your pets are in safe hands.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Community</h3>
                <p className="text-muted-foreground">
                  Building connections between pet lovers in local neighborhoods.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Quality Care</h3>
                <p className="text-muted-foreground">
                  We maintain high standards for the care your pets receive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              To create a world where every pet receives loving care and every pet owner has access to 
              trustworthy pet sitters in their community. We believe that by connecting passionate pet lovers, 
              we can make pet care more accessible, reliable, and filled with joy.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
