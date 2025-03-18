import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getToken, 
  getUser, 
  removeToken, 
  removeUser, 
  verifyToken,
  logout as logoutApi,
  UserProfile
} from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if the user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      
      if (token) {
        try {
          // Verify the token with the backend
          const { user } = await verifyToken(token);
          setUser(user);
        } catch (error) {
          // If the token is invalid, remove it
          console.error('Error verifying token:', error);
          removeToken();
          removeUser();
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Check if we should keep the user logged in
  useEffect(() => {
    const rememberMe = sessionStorage.getItem('wheelshare_remember');
    
    if (rememberMe === 'false') {
      // Set up a listener for when the tab/window is closed
      const handleBeforeUnload = () => {
        removeToken();
        removeUser();
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, []);

  const login = (token: string, userData: UserProfile) => {
    setUser(userData);
  };

  const logout = () => {
    logoutApi();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!user, 
        user, 
        loading,
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 