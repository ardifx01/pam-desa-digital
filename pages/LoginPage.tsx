
import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { login } from '../services/api';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { WaterDropIcon } from '../components/dashboard/user/UserOverview';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting login with email:', email);
      const user = await login(email, password);
      
      if (user) {
        console.log('Login successful, user:', user);
        authLogin(user);
      } else {
        console.log('Login failed: invalid credentials');
        setError('Email atau password salah. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <WaterDropIcon className="mx-auto h-14 w-14 text-primary-600" />
              <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-slate-900">
                PAM Digital Desa Plosobuden
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Kecamatan Deket, Kabupaten Lamongan
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Silakan masuk untuk mengakses dashboard
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-primary-500 sm:text-sm bg-white"
                      placeholder="email@domain.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-primary-500 sm:text-sm bg-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" />
                    <span className="ml-2">Memproses...</span>
                  </div>
                ) : (
                  'Masuk'
                )}
              </Button>

              <p className="text-center text-xs text-slate-400">Lupa password? Hubungi admin.</p>
            </form>
          </div>
        </div>
      </div>

      {/* Right: Decorative panel */}
      <div className="hidden lg:flex relative flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative z-10 text-center text-white px-8">
          <WaterDropIcon className="mx-auto h-20 w-20 text-white/90" />
          <h3 className="mt-6 text-2xl font-bold">Layanan Air Minum Desa</h3>
          <p className="mt-2 text-white/80 max-w-md">
            Sistem manajemen pelanggan, tagihan, dan pelaporan gangguan untuk meningkatkan layanan air minum di Desa Plosobuden.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
