import React, { useState, useEffect, Fragment } from 'react';
import { User, UserRole } from '../../../types';
import { getAllUsers, updateUser, addUser, resetUserPassword } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { Button } from '../../ui/Button';
import { UserPlusIcon, KeyIcon } from '../../icons';
import { Dialog, Transition } from '@headlessui/react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    address: '',
    role: UserRole.USER,
    connectionStatus: 'active' as const
  });
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.USER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  };

  const handleStatusChange = (user: User, newStatus: 'active' | 'inactive') => {
    updateUser(user.id, { connectionStatus: newStatus }).then(() => {
        fetchUsers();
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value,
      role: newUserRole,
      connectionStatus: 'active' as const
    }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    addUser({ ...newUser, role: newUserRole })
      .then(() => {
        setIsSubmitting(false);
        setIsModalOpen(false);
        setNewUser({ 
          name: '', 
          email: '', 
          phoneNumber: '', 
          password: '', 
          address: '',
          role: UserRole.USER,
          connectionStatus: 'active'
        });
        setNewUserRole(UserRole.USER);
        fetchUsers();
      })
      .catch(err => {
        console.error("Failed to add user:", err);
        setIsSubmitting(false);
      });
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !resetPassword.trim()) return;
    
    setIsResettingPassword(true);
    try {
      await resetUserPassword(selectedUser.id, resetPassword);
      setIsResetPasswordModalOpen(false);
      setSelectedUser(null);
      setResetPassword('');
      fetchUsers();
    } catch (error) {
      console.error("Failed to reset password:", error);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user);
    setResetPassword('');
    setIsResetPasswordModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h2>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<UserPlusIcon className="w-5 h-5" />}>
          Tambah Pengguna
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pengguna</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kontak</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">No. {user.customerNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{user.phoneNumber}</div>
                      {user.email && <div className="text-sm text-slate-500">{user.email}</div>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' :
                        user.role === UserRole.FIELD_OFFICER ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role === UserRole.ADMIN ? 'Admin' :
                         user.role === UserRole.FIELD_OFFICER ? 'Petugas Lapangan' : 'Pengguna'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={user.connectionStatus}
                        onChange={(e) => handleStatusChange(user, e.target.value as 'active' | 'inactive')}
                        className={`text-sm rounded-full px-3 py-1 font-medium ${
                          user.connectionStatus === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => openResetPasswordModal(user)}
                        leftIcon={<KeyIcon className="w-4 h-4" />}
                      >
                        Reset Password
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add User Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Tambah Pengguna Baru
                  </Dialog.Title>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nama Lengkap *</label>
                      <input type="text" name="name" value={newUser.name} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input type="email" name="email" value={newUser.email} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nomor Telepon (Opsional)</label>
                      <input type="tel" name="phoneNumber" value={newUser.phoneNumber} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password *</label>
                      <input type="password" name="password" value={newUser.password} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alamat *</label>
                      <input type="text" name="address" value={newUser.address} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role *</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value={UserRole.USER}>Pengguna</option>
                        <option value={UserRole.FIELD_OFFICER}>Petugas Lapangan</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Menambahkan...' : 'Tambah Pengguna'}
                      </Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Reset Password Modal */}
      <Transition appear show={isResetPasswordModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsResetPasswordModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Reset Password untuk {selectedUser?.name}
                  </Dialog.Title>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password Baru *</label>
                      <input
                        type="password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Masukkan password baru"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="secondary" onClick={() => setIsResetPasswordModalOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleResetPassword} disabled={isResettingPassword || !resetPassword.trim()}>
                        {isResettingPassword ? 'Mereset...' : 'Reset Password'}
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default UserManagement;