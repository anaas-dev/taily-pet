import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, MessageCircle, User, LogOut, Shield, LayoutDashboard, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useSitterRole } from "@/hooks/useSitterRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { isApprovedSitter, loading: sitterLoading } = useSitterRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold">
              <span className="text-gradient">Taily</span>
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              pet lovers
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/browse"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              Find Pet Sitters
            </Link>
            <Link
              to="/become-sitter"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              Become a Pet Sitter
            </Link>
            <Link
              to="/about"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              About Us
            </Link>
            {!adminLoading && isAdmin && (
              <Link
                to="/admin"
                className="text-foreground/80 hover:text-primary font-medium transition-colors flex items-center gap-1"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" asChild>
              <Link to="/browse">
                <Search className="w-5 h-5" />
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" asChild>
              <Link to={user ? "/messages" : "/auth"}>
                <MessageCircle className="w-5 h-5" />
              </Link>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-muted-foreground">
                    {typeof user.email === 'string' ? user.email : 'No email'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/become-sitter">My Sitter Profile</Link>
                  </DropdownMenuItem>
                  {!sitterLoading && isApprovedSitter && (
                    <DropdownMenuItem asChild>
                      <Link to="/sitter-dashboard" className="flex items-center">
                        <PawPrint className="w-4 h-4 mr-2" />
                        Sitter Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {!adminLoading && isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/browse"
                className="text-foreground/80 hover:text-primary font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Find Pet Sitters
              </Link>
              <Link
                to="/become-sitter"
                className="text-foreground/80 hover:text-primary font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Become a Pet Sitter
              </Link>
              <Link
                to="/about"
                className="text-foreground/80 hover:text-primary font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About Us
              </Link>
              {!adminLoading && isAdmin && (
                <Link
                  to="/admin"
                  className="text-foreground/80 hover:text-primary font-medium transition-colors flex items-center gap-1"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              <hr className="border-border" />
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">{typeof user.email === 'string' ? user.email : 'No email'}</span>
                  <Link
                    to="/dashboard"
                    className="text-foreground/80 hover:text-primary font-medium transition-colors flex items-center gap-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </Link>
                  {!sitterLoading && isApprovedSitter && (
                    <Link
                      to="/sitter-dashboard"
                      className="text-foreground/80 hover:text-primary font-medium transition-colors flex items-center gap-1"
                      onClick={() => setIsOpen(false)}
                    >
                      <PawPrint className="w-4 h-4" />
                      Sitter Dashboard
                    </Link>
                  )}
                  <Button variant="outline" onClick={handleSignOut} className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
