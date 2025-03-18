import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { 
  Vehicle, 
  VehicleType
} from '@/data/mockData';
import { 
  addVehicle, 
  getAllVehicles, 
  getUserVehicles, 
  getVehicleById, 
  updateVehicle, 
  deleteVehicle, 
  searchVehiclesByQuery, 
  filterVehicles, 
  VehicleFormData
} from '@/lib/api';
import { useAuth } from './AuthContext';

interface VehicleContextType {
  vehicles: Vehicle[];
  userVehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  currentVehicle: Vehicle | null;
  fetchVehicles: () => Promise<void>;
  fetchUserVehicles: () => Promise<void>;
  fetchVehicleById: (id: string) => Promise<Vehicle>;
  addNewVehicle: (vehicleData: VehicleFormData) => Promise<Vehicle>;
  updateExistingVehicle: (id: string, vehicleData: Partial<VehicleFormData>) => Promise<Vehicle>;
  removeVehicle: (id: string) => Promise<void>;
  searchVehicles: (query: string) => Promise<Vehicle[]>;
  filterVehiclesList: (params: {
    location?: string;
    type?: VehicleType;
    priceMin?: number;
    priceMax?: number;
  }) => Promise<Vehicle[]>;
  clearCurrentVehicle: () => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function useVehicles() {
  const context = useContext(VehicleContext);
  
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  
  return context;
}

export const VehicleProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedVehicles = await getAllVehicles();
      setVehicles(fetchedVehicles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserVehicles = useCallback(async () => {
    if (!isAuthenticated) {
      setUserVehicles([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const fetchedVehicles = await getUserVehicles();
      setUserVehicles(fetchedVehicles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user vehicles');
      console.error('Error fetching user vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchVehicleById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const vehicle = await getVehicleById(id);
      setCurrentVehicle(vehicle);
      return vehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicle');
      console.error('Error fetching vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addNewVehicle = useCallback(async (vehicleData: VehicleFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newVehicle = await addVehicle(vehicleData);
      if (!newVehicle) {
        throw new Error('Failed to add vehicle. Please try again.');
      }
      setVehicles(prev => [...prev, newVehicle]);
      setUserVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add vehicle');
      console.error('Error adding vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingVehicle = useCallback(async (id: string, vehicleData: Partial<VehicleFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedVehicle = await updateVehicle(id, vehicleData);
      
      setVehicles(prev => 
        prev.map(vehicle => vehicle.id === id ? updatedVehicle : vehicle)
      );
      
      setUserVehicles(prev => 
        prev.map(vehicle => vehicle.id === id ? updatedVehicle : vehicle)
      );
      
      if (currentVehicle?.id === id) {
        setCurrentVehicle(updatedVehicle);
      }
      
      return updatedVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle');
      console.error('Error updating vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentVehicle]);

  const removeVehicle = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteVehicle(id);
      
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      setUserVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      
      if (currentVehicle?.id === id) {
        setCurrentVehicle(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle');
      console.error('Error deleting vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentVehicle]);

  const searchVehicles = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchVehiclesByQuery(query);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search vehicles');
      console.error('Error searching vehicles:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const filterVehiclesList = useCallback(async (params: {
    location?: string;
    type?: VehicleType;
    priceMin?: number;
    priceMax?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const results = await filterVehicles(params);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter vehicles');
      console.error('Error filtering vehicles:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCurrentVehicle = useCallback(() => {
    setCurrentVehicle(null);
  }, []);

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        userVehicles,
        loading,
        error,
        currentVehicle,
        fetchVehicles,
        fetchUserVehicles,
        fetchVehicleById,
        addNewVehicle,
        updateExistingVehicle,
        removeVehicle,
        searchVehicles,
        filterVehiclesList,
        clearCurrentVehicle
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}; 