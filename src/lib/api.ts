// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Interface for user registration
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Interface for user login
export interface LoginData {
  email: string;
  password: string;
}

// Interface for user profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Interface for auth response
export interface AuthResponse {
  token: string;
  user: UserProfile;
  message: string;
}

// Store token in localStorage
const storeToken = (token: string): void => {
  localStorage.setItem('wheelshare_token', token);
};

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('wheelshare_token');
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('wheelshare_token');
};

// Store user in localStorage
const storeUser = (user: UserProfile): void => {
  localStorage.setItem('wheelshare_user', JSON.stringify(user));
};

// Get user from localStorage
export const getUser = (): UserProfile | null => {
  const userStr = localStorage.getItem('wheelshare_user');
  return userStr ? JSON.parse(userStr) : null;
};

// Remove user from localStorage
export const removeUser = (): void => {
  localStorage.removeItem('wheelshare_user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Register a new user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }

  return response.json();
};

// Login a user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }

  const authResponse = await response.json();
  
  // Store token and user data in localStorage
  storeToken(authResponse.token);
  storeUser(authResponse.user);
  
  return authResponse;
};

// Verify token validity
export const verifyToken = async (token: string): Promise<{ valid: boolean; user: UserProfile }> => {
  const response = await fetch(`${API_URL}/verify-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token })
  });

  if (!response.ok) {
    removeToken();
    removeUser();
    throw new Error('Invalid token');
  }

  return response.json();
};

// Logout user
export const logout = (): void => {
  removeToken();
  removeUser();
};

// Add auth header to requests
export const authHeader = (): HeadersInit => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Vehicle API Functions
import { Vehicle, VehicleType } from '@/data/mockData';

export interface VehicleFormData {
  type: VehicleType;
  title: string;
  description: string;
  price: number;
  priceUnit: 'hour' | 'day';
  location: string;
  imageUrl: string;
  features: string[];
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
    gears?: number;
    electric?: boolean;
  };
}

// Add a new vehicle
export const addVehicle = async (vehicleData: VehicleFormData): Promise<Vehicle | null> => {
  const token = getToken();
  if (!token) {
    console.error('Authentication required');
    return null;
  }

  try {
    console.log('Adding vehicle...');
    const response = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(vehicleData)
    });

    if (!response.ok) {
      console.error('Server response not OK:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('Successfully added vehicle');
    return data;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return null;
  }
};

// Get all vehicles
export const getAllVehicles = async (): Promise<Vehicle[]> => {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch vehicles');
  }

  return response.json();
};

// Get user's vehicles
export const getUserVehicles = async (): Promise<Vehicle[]> => {
  const token = getToken();
  if (!token) {
    console.warn('Auth token missing, returning empty vehicle array');
    return [];
  }

  try {
    console.log('Fetching user vehicles...');
    const response = await fetch(`${API_URL}/user/vehicles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Server response not OK:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log('Successfully fetched user vehicles');
    return data;
  } catch (error) {
    console.error('Error fetching user vehicles:', error);
    return [];
  }
};

// Get vehicle by ID
export const getVehicleById = async (id: string): Promise<Vehicle> => {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch vehicle');
  }

  return response.json();
};

// Update vehicle
export const updateVehicle = async (id: string, vehicleData: Partial<VehicleFormData>): Promise<Vehicle> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(vehicleData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update vehicle');
  }

  return response.json();
};

// Delete vehicle
export const deleteVehicle = async (id: string): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete vehicle');
  }

  return response.json();
};

// Search vehicles by query
export const searchVehiclesByQuery = async (query: string): Promise<Vehicle[]> => {
  const response = await fetch(`${API_URL}/vehicles/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to search vehicles');
  }

  return response.json();
};

// Filter vehicles by location and type
export const filterVehicles = async (params: {
  location?: string;
  type?: VehicleType;
  priceMin?: number;
  priceMax?: number;
}): Promise<Vehicle[]> => {
  const queryParams = new URLSearchParams();
  
  if (params.location) queryParams.append('location', params.location);
  if (params.type) queryParams.append('type', params.type);
  if (params.priceMin !== undefined) queryParams.append('priceMin', params.priceMin.toString());
  if (params.priceMax !== undefined) queryParams.append('priceMax', params.priceMax.toString());
  
  const response = await fetch(`${API_URL}/vehicles/filter?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to filter vehicles');
  }

  return response.json();
};

// Booking Interfaces
export interface BookingFormData {
  vehicleId: string;
  startDate: string;
  endDate: string;
  message?: string;
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  vehicleImage: string;
  renterId: string;
  renterName: string;
  renterEmail: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  createdAt: string;
  message: string;
}

// Create a booking
export const createBooking = async (bookingData: BookingFormData): Promise<Booking> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create booking');
  }

  return response.json();
};

// Get user's bookings (as a renter)
export const getUserBookings = async (): Promise<Booking[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/bookings/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch user bookings');
  }

  return response.json();
};

// Get bookings for vehicles owned by the user
export const getOwnerBookings = async (): Promise<Booking[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/bookings/owner`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch owner bookings');
  }

  return response.json();
};

// Update booking status (approve, decline, complete)
export const updateBookingStatus = async (bookingId: string, status: 'approved' | 'declined' | 'completed'): Promise<Booking> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update booking status');
  }

  return response.json();
};

// Add or update booking message
export const updateBookingMessage = async (bookingId: string, message: string): Promise<Booking> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/bookings/${bookingId}/message`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update booking message');
  }

  return response.json();
}; 