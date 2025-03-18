import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Car, Bike, Menu, Search, User, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vehicles?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="border-b sticky top-0 z-50 bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Car className="h-6 w-6 text-brand-blue" />
            <Bike className="h-5 w-5 text-brand-green" />
          </div>
          <span className="font-bold text-xl hidden sm:inline">E-Hire</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/vehicles?type=car" className="text-gray-700 hover:text-brand-blue font-medium">
            Cars
          </Link>
          <Link to="/vehicles?type=bike" className="text-gray-700 hover:text-brand-green font-medium">
            Bikes
          </Link>
          {/* <Link to="/list-vehicle" className="text-gray-700 hover:text-brand-darkBlue font-medium">
            List Your Vehicle
          </Link> */}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex relative w-1/3">
          <Input
            type="text"
            placeholder="Search for vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full pr-10"
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost" 
            className="absolute right-0 top-0 h-full"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Auth/User Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/list-vehicle">List Your Vehicle</Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user?.name}</span>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col gap-6 pt-6">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search for vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              <nav className="flex flex-col gap-3">
                <Link to="/vehicles?type=car" className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5 text-brand-blue" />
                  Cars
                </Link>
                <Link to="/vehicles?type=bike" className="flex items-center gap-2 text-lg">
                  <Bike className="h-5 w-5 text-brand-green" />
                  Bikes
                </Link>
                <Link to="/list-vehicle" className="flex items-center gap-2 text-lg">
                  List Your Vehicle
                </Link>
              </nav>
              
              <div className="flex flex-col gap-2 mt-4">
                {isAuthenticated ? (
                  <Button asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/register">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
