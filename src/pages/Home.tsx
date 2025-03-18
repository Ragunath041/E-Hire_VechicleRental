import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Bike, Search, MapPin, Star, Clock } from "lucide-react";
import VehicleCard from '@/components/VehicleCard';
import { useVehicles } from '@/contexts/VehicleContext';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const { vehicles, fetchVehicles, loading } = useVehicles();
  
  useEffect(() => {
    // Fetch vehicles when component mounts
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.append("search", searchQuery);
    }
    
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              Rent the Perfect Wheels for Your Journey
            </h1>
            <p className="text-lg md:text-xl mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Connect with local vehicle owners to find cars and bikes 
              that fit your needs, budget, and style.
            </p>
            
            <form onSubmit={handleSearch} className="bg-white rounded-lg p-4 shadow-lg animate-slide-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10"
                  />
                </div>
                
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Find Vehicles
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Available Vehicles</h2>
          
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.slice(0, 6).map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No vehicles available at the moment.</p>
              <p className="text-gray-500">Be the first to list your vehicle!</p>
            </div>
          )}
          
          <div className="text-center mt-8">
            <Button asChild>
              <a href="/vehicles">View All Vehicles</a>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">How WheelShare Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-brand-blue/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-brand-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Find the Perfect Vehicle</h3>
              <p className="text-gray-600">
                Browse our selection of cars and bikes, filter by type, location, and price to find your ideal match.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-brand-green/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-brand-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Book Instantly</h3>
              <p className="text-gray-600">
                Reserve your vehicle for the dates you need with our secure booking system and flexible scheduling.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-brand-darkBlue/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-brand-darkBlue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Enjoy Your Ride</h3>
              <p className="text-gray-600">
                Pick up your vehicle, hit the road, and experience the freedom of having the perfect wheels for your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500" fill="#f59e0b" />
                  ))}
                </div>
                <span className="text-gray-600">5.0</span>
              </div>
              <p className="text-gray-600 mb-4">
                "I rented a Tesla Model 3 for a weekend trip, and the entire experience was seamless. The car was in perfect condition, and the owner was very responsive."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://randomuser.me/api/portraits/women/12.jpg" 
                  alt="User" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-semibold">Sarah Thompson</h4>
                  <p className="text-sm text-gray-500">Renter</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500" fill="#f59e0b" />
                  ))}
                </div>
                <span className="text-gray-600">5.0</span>
              </div>
              <p className="text-gray-600 mb-4">
                "Listing my bike on WheelShare has been a great way to earn extra income. The platform is user-friendly, and I've met some amazing people in the process."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://randomuser.me/api/portraits/men/67.jpg" 
                  alt="User" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-semibold">James Wilson</h4>
                  <p className="text-sm text-gray-500">Vehicle Owner</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500" fill={i < 4 ? "#f59e0b" : "#e5e7eb"} />
                  ))}
                </div>
                <span className="text-gray-600">4.0</span>
              </div>
              <p className="text-gray-600 mb-4">
                "I needed a car for a quick day trip, and WheelShare made it so simple. No complicated paperwork or long lines - just a quick booking and I was on my way."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="User" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-sm text-gray-500">Renter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join Our Community?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Whether you want to rent a vehicle or list your own, WheelShare makes it easy, secure, and rewarding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <a href="/vehicles">Find a Vehicle</a>
            </Button>
            <Button asChild size="lg">
              <a href="/list-vehicle">List Your Vehicle</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
