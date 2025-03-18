import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VehicleCard from '@/components/VehicleCard';
import SearchFilters, { FilterState } from '@/components/SearchFilters';
import { Vehicle } from '@/data/mockData';
import { Filter, Search } from 'lucide-react';
import { useVehicles } from '@/contexts/VehicleContext';

const Vehicles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  const { 
    vehicles, 
    loading: isLoading, 
    fetchVehicles,
    searchVehicles
  } = useVehicles();

  useEffect(() => {
    // Fetch vehicles on component mount
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    // Apply initial filters based on URL parameters
    const applyFilters = async () => {
      try {
        if (searchQuery) {
          // If there's a search query, search for vehicles
          const results = await searchVehicles(searchQuery);
          setFilteredVehicles(results);
        } else {
          // If no search query, show all vehicles
          setFilteredVehicles(vehicles);
        }
      } catch (err) {
        console.error('Error applying filters:', err);
      }
    };
    
    if (vehicles.length > 0) {
      applyFilters();
    } else {
      setFilteredVehicles([]);
    }
  }, [vehicles, searchQuery, searchVehicles]);

  const handleFilterChange = (filters: FilterState) => {
    let results = [...vehicles];
    
    // Filter by type
    if (filters.type !== 'all') {
      results = results.filter(vehicle => vehicle.type === filters.type);
    }
    
    // Filter by price
    results = results.filter(vehicle => 
      vehicle.price >= filters.priceRange[0] && vehicle.price <= filters.priceRange[1]
    );
    
    // Filter by location
    if (filters.location !== 'All Locations') {
      results = results.filter(vehicle => 
        vehicle.location.includes(filters.location)
      );
    }
    
    // Sort results
    if (filters.sortBy === 'price-low') {
      results.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high') {
      results.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    }
    
    setFilteredVehicles(results);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Page Header */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Available Vehicles</h1>
            <Button 
              variant="outline" 
              onClick={() => setFiltersOpen(true)}
              className="md:hidden flex items-center"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
          
          {searchQuery && (
            <p className="text-muted-foreground mb-4">
              Search results for: <span className="font-medium text-foreground">"{searchQuery}"</span>
            </p>
          )}
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Column - desktop */}
            <div className="hidden md:block w-full md:w-1/4 lg:w-1/5">
              <div className="bg-gray-50 p-4 rounded-lg sticky top-24">
                <h2 className="font-semibold mb-4 flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </h2>
                <SearchFilters 
                  onFilterChange={handleFilterChange} 
                  isOpen={true}
                  onClose={() => {}}
                />
              </div>
            </div>
            
            {/* Mobile Filters - slide in from left */}
            <SearchFilters 
              onFilterChange={handleFilterChange} 
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
            />
            
            {/* Results Column */}
            <div className="w-full md:w-3/4 lg:w-4/5">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-gray-100 animate-pulse h-64 rounded-lg"></div>
                  ))}
                </div>
              ) : filteredVehicles.length > 0 ? (
                <>
                  <p className="text-muted-foreground mb-4">
                    Showing {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                      <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                    handleFilterChange({
                      type: "all",
                      priceRange: [0, 100],
                      location: "All Locations",
                      sortBy: "recommended",
                    });
                  }}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
