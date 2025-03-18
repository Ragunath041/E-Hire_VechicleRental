export type VehicleType = 'car' | 'bike';

export interface Vehicle {
  id: string;
  type: VehicleType;
  title: string;
  description: string;
  price: number;
  priceUnit: 'hour' | 'day';
  location: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  features: string[];
  owner: {
    id: string;
    name: string;
    rating: number;
    imageUrl: string;
    responseRate: number;
  };
  availability: {
    startDate: string;
    endDate: string;
  };
  specifications?: {
    make?: string;
    model?: string;
    year?: number;
    transmission?: 'automatic' | 'manual';
    seats?: number;
    fuelType?: string;
    type?: string;
    size?: string;
    gears?: number;
    electric?: boolean;
  };
}

export const mockVehicles: Vehicle[] = [];

export const getFeaturedVehicles = (): Vehicle[] => {
  return mockVehicles.slice(0, 3);
};

export const getVehiclesByType = (type: VehicleType): Vehicle[] => {
  return mockVehicles.filter(vehicle => vehicle.type === type);
};

export const getVehicleById = (id: string): Vehicle | undefined => {
  return mockVehicles.find(vehicle => vehicle.id === id);
};

export const searchVehicles = (query: string): Vehicle[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockVehicles.filter(vehicle => 
    vehicle.title.toLowerCase().includes(lowercaseQuery) ||
    vehicle.description.toLowerCase().includes(lowercaseQuery) ||
    vehicle.location.toLowerCase().includes(lowercaseQuery)
  );
};
