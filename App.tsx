
import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { User, UserRole } from './types';
import { logout } from './services/api';
import { Spinner } from './components/ui/Spinner';

export const AuthContext = React.createContext<{
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (loggedInUser: User) => {
    console.log('User logged in:', loggedInUser);
    setUser(loggedInUser);
    localStorage.setItem('pam-desa-user', JSON.stringify(loggedInUser));
    setError(null);
  };

  const handleLogout = useCallback(() => {
    console.log('User logged out');
    logout();
    setUser(null);
    localStorage.removeItem('pam-desa-user');
    setError(null);
  }, []);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('pam-desa-user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        console.log('Restored user from localStorage:', parsedUser);
        
        // Validate user data
        if (parsedUser && parsedUser.id && parsedUser.role) {
          setUser(parsedUser);
        } else {
          console.error('Invalid user data in localStorage');
          localStorage.removeItem('pam-desa-user');
          setError('Data pengguna tidak valid. Silakan login ulang.');
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('pam-desa-user');
      setError('Gagal memuat data pengguna. Silakan login ulang.');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Terjadi Kesalahan</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              localStorage.removeItem('pam-desa-user');
              window.location.reload();
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Login Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout }}>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        {user ? <DashboardPage /> : <LoginPage />}
      </div>
    </AuthContext.Provider>
  );
};

export default App;
