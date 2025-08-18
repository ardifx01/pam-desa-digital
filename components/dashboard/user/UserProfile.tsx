
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../App';
import { User } from '../../../types';
import { updateUserProfile } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';

const UserProfile: React.FC = () => {
  const { user, login } = useContext(AuthContext);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email || '',
        address: user.address,
        phoneNumber: user.phoneNumber,
      });
    }
  }, [user]);

  if (!user) {
    return (
      <Card>
        <div className="flex justify-center p-8"><Spinner /></div>
      </Card>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const updatedUser = await updateUserProfile(user.id, formData);
      login(updatedUser); // Update context and localStorage
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Password baru dan konfirmasi password tidak cocok');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      return;
    }
    
    if (passwordData.currentPassword !== user.password) {
      setPasswordError('Password saat ini salah');
      return;
    }
    
    setLoading(true);
    try {
      const updatedUser = await updateUserProfile(user.id, { password: passwordData.newPassword });
      login(updatedUser);
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update password", error);
      setPasswordError('Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Information */}
      <Card>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0 text-center md:text-left">
              <img src={user.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full mx-auto mb-4"/>
              <h3 className="text-lg font-medium leading-6 text-slate-900">{user.name}</h3>
              <p className="mt-1 text-sm text-slate-600">No. Pelanggan: {user.customerNumber}</p>
              <p className="mt-1 text-sm text-slate-600">Status: <span className={`font-semibold ${user.connectionStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>{user.connectionStatus === 'active' ? 'Aktif' : 'Tidak Aktif'}</span></p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                    <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Alamat Email (Opsional)</label>
                    <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                    <p className="mt-1 text-xs text-slate-500">Email bersifat opsional dan dapat diubah.</p>
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700">Nomor Telepon</label>
                    <input type="text" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-slate-700">Alamat</label>
                    <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleChange} className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                  </div>
                </div>
                <div className="px-4 py-3 bg-slate-50 text-right sm:px-6">
                  {success && <span className="text-green-600 text-sm mr-4">Profil berhasil diperbarui!</span>}
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Card>

      {/* Password Change */}
      <Card>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-slate-900">Ubah Password</h3>
            <Button 
              variant="secondary" 
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              {showPasswordChange ? 'Batal' : 'Ubah Password'}
            </Button>
          </div>
          
          {showPasswordChange && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">Password Saat Ini</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  id="currentPassword" 
                  value={passwordData.currentPassword} 
                  onChange={handlePasswordChange} 
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" 
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">Password Baru</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  id="newPassword" 
                  value={passwordData.newPassword} 
                  onChange={handlePasswordChange} 
                  required
                  minLength={6}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" 
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  id="confirmPassword" 
                  value={passwordData.confirmPassword} 
                  onChange={handlePasswordChange} 
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" 
                />
              </div>
              
              {passwordError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {passwordError}
                </div>
              )}
              
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Mengubah...' : 'Ubah Password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
