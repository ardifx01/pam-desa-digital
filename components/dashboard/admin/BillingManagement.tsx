import React, { useState, useEffect } from 'react';
import { User, Bill } from '../../../types';
import { getAllUsers, addMeterReading, getUserBills } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { Button } from '../../ui/Button';

const BillingManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [lastReading, setLastReading] = useState(0);
  const [currentReading, setCurrentReading] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getAllUsers().then(data => {
      setUsers(data.filter(u => u.role === 'USER'));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedUser) {
      getUserBills(selectedUser.id).then(bills => {
        const lastBill = bills.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];
        setLastReading(lastBill ? lastBill.currentReading : 0);
        setCurrentReading('');
      });
    } else {
      setLastReading(0);
    }
  }, [selectedUser]);

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user || null);
    setSuccess('');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !currentReading || +currentReading <= lastReading) {
        alert("Data tidak valid. Pastikan pengguna dipilih dan pembacaan saat ini lebih besar dari sebelumnya.");
        return;
    }
    setSubmitting(true);
    setSuccess('');
    addMeterReading(selectedUser.id, +currentReading).then(newBill => {
        setSubmitting(false);
        setSuccess(`Tagihan untuk ${selectedUser.name} periode ${newBill.period} berhasil dibuat!`);
        setSelectedUser(null);
        setCurrentReading('');
    });
  }

  return (
    <Card title="Input Meteran Bulanan">
      {loading ? (
        <div className="flex justify-center p-8"><Spinner /></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-slate-700">Pilih Pelanggan</label>
            <select
              id="user-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedUser?.id || ''}
              onChange={(e) => handleUserSelect(e.target.value)}
            >
              <option value="" disabled>-- Pilih seorang pelanggan --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.customerNumber} - {user.name}</option>
              ))}
            </select>
          </div>
          
          {selectedUser && (
            <div className="p-4 bg-slate-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Pembacaan Meteran Bulan Lalu</label>
                    <input type="number" value={lastReading} disabled className="mt-1 w-full bg-slate-200 border-slate-300 rounded-md shadow-sm"/>
                    <p className="text-xs text-slate-500 mt-1">Dalam meter kubik (m³)</p>
                </div>
                <div>
                    <label htmlFor="current-reading" className="block text-sm font-medium text-slate-700">Pembacaan Meteran Bulan Ini</label>
                    <input 
                        type="number" 
                        id="current-reading"
                        value={currentReading}
                        onChange={(e) => setCurrentReading(e.target.value)}
                        min={lastReading + 1}
                        required
                        className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div className="md:col-span-2">
                    <div className="text-sm text-slate-600">
                        <p><strong>Pelanggan:</strong> {selectedUser.name}</p>
                        <p><strong>No. Pelanggan:</strong> {selectedUser.customerNumber}</p>
                        {selectedUser.email && (
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                        )}
                        <p><strong>Alamat:</strong> {selectedUser.address}</p>
                    </div>
                </div>
            </div>
          )}

          {success && <p className="text-green-600 bg-green-100 p-3 rounded-md">{success}</p>}

          <div className="text-right">
              <Button type="submit" isLoading={submitting} disabled={!selectedUser || !currentReading}>
                  Buat Tagihan
              </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default BillingManagement;