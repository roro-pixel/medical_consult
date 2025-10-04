import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined?: string;
  last_login?: string;
}

interface AuthState {
  authenticated: boolean;
  user: User | null;
}

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_API_URL,
  AUTH: '/auth',
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({ authenticated: false, user: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (userData: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Register error:', errorData);
        throw new Error(`Erreur lors de l'inscription: ${response.status}`);
      }

      const data = await response.json();
      toast.success('Utilisateur enregistré avec succès');
      return true;
    } catch (error) {
      const errorMessage = 'Erreur lors de l\'inscription';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Register error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: {
    username: string;
    password: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error:', errorData);
        throw new Error(`Erreur lors de la connexion: ${response.status}`);
      }

      const data = await response.json();
      setAuthState({
        authenticated: true,
        user: data.user,
      });

      toast.success('Connexion réussie');
      return true;
    } catch (error) {
      const errorMessage = 'Erreur lors de la connexion';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = async (): Promise<AuthState | null> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH}/user/`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const newAuthState = {
        authenticated: data.authenticated,
        user: data.user,
      };

      setAuthState(newAuthState);
      return newAuthState;
    } catch (error) {
      console.error('Get user info error:', error);
      setAuthState({ authenticated: false, user: null });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH}/logout/`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la déconnexion: ${response.status}`);
      }

      setAuthState({ authenticated: false, user: null });
      toast.success('Déconnexion réussie');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
      console.error('Logout error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    authState,
    loading,
    error,
    register,
    login,
    getUserInfo,
    logout,
  };
};