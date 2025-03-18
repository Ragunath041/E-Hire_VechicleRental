import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, Bike, Filter, X } from "lucide-react";

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface FilterState {
  type: string;
  priceRange: [number, number];
  location: string;
  sortBy: string;
}

const locations = [
  "All Locations",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Goa"
];

const SearchFilters = ({ onFilterChange, isOpen, onClose }: SearchFiltersProps) => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    type: searchParams.get("type") || "all",
    priceRange: [0, 100],
    location: "All Locations",
    sortBy: "recommended",
  });

  useEffect(() => {
    // Get type from URL if it exists
    const typeParam = searchParams.get("type");
    if (typeParam) {
      setFilters(prev => ({ ...prev, type: typeParam }));
    }
  }, [searchParams]);

  const handleTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, type: value }));
  };

  const handlePriceChange = (value: number[]) => {
    // Ensure we always have exactly two values for the price range tuple
    setFilters(prev => ({ ...prev, priceRange: [value[0], value[1]] as [number, number] }));
  };

  const handleLocationChange = (value: string) => {
    setFilters(prev => ({ ...prev, location: value }));
  };

  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
  };

  const handleApply = () => {
    onFilterChange(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      type: "all",
      priceRange: [0, 100] as [number, number],
      location: "All Locations",
      sortBy: "recommended",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className={`
      fixed inset-0 z-40 bg-background p-4 transition-transform duration-300 overflow-auto
      md:static md:inset-auto md:p-0 md:z-0 md:translate-x-0 md:transform-none md:bg-transparent
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-lg font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base">Vehicle Type</Label>
          <RadioGroup
            value={filters.type}
            onValueChange={handleTypeChange}
            className="flex space-x-2"
          >
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-md">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex items-center cursor-pointer">
                <span className="ml-1">All</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-md">
              <RadioGroupItem value="car" id="car" />
              <Label htmlFor="car" className="flex items-center cursor-pointer">
                <Car className="h-4 w-4 mr-1 text-brand-blue" />
                <span>Cars</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-md">
              <RadioGroupItem value="bike" id="bike" />
              <Label htmlFor="bike" className="flex items-center cursor-pointer">
                <Bike className="h-4 w-4 mr-1 text-brand-green" />
                <span>Bikes</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="text-base">Price Range</Label>
            <span className="text-sm text-muted-foreground">
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </span>
          </div>
          <Slider
            defaultValue={[0, 100]}
            max={100}
            step={1}
            value={[filters.priceRange[0], filters.priceRange[1]]}
            onValueChange={handlePriceChange}
            className="my-6"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base">Location</Label>
          <Select 
            value={filters.location}
            onValueChange={handleLocationChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-base">Sort By</Label>
          <Select 
            value={filters.sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
