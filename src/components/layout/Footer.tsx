import { Link } from "react-router-dom";
import { Mail, MapPin, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-extrabold mb-4">
              <span className="text-primary">Taily</span>{" "}
              <span className="font-normal text-sm opacity-80">pet lovers</span>
            </h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Connecting pet owners with trusted, loving pet sitters in your community.
              Your pets deserve the best care when you're away.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/browse" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Find Pet Sitters
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/messages" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Messages
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Mail className="w-4 h-4 text-primary" />
                tailypetlovers@gmail.com
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <MapPin className="w-4 h-4 text-primary" />
                Nicosia, Cyprus
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61578942467670" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/tailypetlovers/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Taily. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
