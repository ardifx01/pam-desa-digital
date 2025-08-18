
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../App';
import { Bill } from '../../../types';
import { getUserBills } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { BillIcon, ChartIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../../icons';

export const WaterDropIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" className={className}>
        <path d="M192 512C86 512 0 426 0 320C0 228.8 130.2 57.7 166.6 11.7C172.6 4.2 181.5 0 191.1 0h1.8c9.6 0 18.5 4.2 24.5 11.7C253.8 57.7 384 228.8 384 320c0 106-86 192-192 192zM96 336c0-17.7 14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32s-32-14.3-32-32zm160-16c-17.7 0-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32s-14.3-32-32-32z"/>
    </svg>
);

const UserOverview: React.FC<{ setActiveView: (view: string) => void }> = ({ setActiveView }) => {
  const { user } = useContext(AuthContext);
  const [unpaidBill, setUnpaidBill] = useState<Bill | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserBills(user.id)
        .then(bills => {
          const firstUnpaid = bills.find(b => b.status === 'unpaid');
          setUnpaidBill(firstUnpaid || null);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching bills for overview:', error);
          setUnpaidBill(null);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg text-white">
          <h2 className="text-3xl font-bold">Halo, {user.name}!</h2>
          <p className="mt-2 text-primary-200">Selamat datang di dasbor PAM Desa Anda.</p>
          {user.email && (
            <p className="mt-1 text-primary-200 text-sm">Email: {user.email}</p>
          )}
          <p className="mt-1 text-primary-200 text-sm">No. Pelanggan: {user.customerNumber}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Tagihan Berikutnya" className="bg-white">
            <div className="flex justify-center p-4">
              <Spinner size="sm" />
            </div>
          </Card>
          
          <div className="space-y-6">
            <Card title="Aksi Cepat">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setActiveView('bills')} className="text-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition">
                  <BillIcon className="w-10 h-10 mx-auto text-primary-600 mb-2"/>
                  <p className="font-semibold text-slate-700">Lihat Semua Tagihan</p>
                </button>
                <button onClick={() => setActiveView('usage')} className="text-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition">
                  <ChartIcon className="w-10 h-10 mx-auto text-primary-600 mb-2"/>
                  <p className="font-semibold text-slate-700">Cek Grafik Pakai</p>
                </button>
                <button onClick={() => setActiveView('report')} className="col-span-1 sm:col-span-2 text-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition">
                  <ExclamationTriangleIcon className="w-10 h-10 mx-auto text-red-600 mb-2"/>
                  <p className="font-semibold text-red-700">Lapor Gangguan Air</p>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon, title, value, colorClass }: { 
    icon: React.ReactNode; 
    title: string; 
    value: string; 
    colorClass: string; 
  }) => (
    <Card className="flex items-center p-4">
      <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="p-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg text-white">
        <h2 className="text-3xl font-bold">Halo, {user.name}!</h2>
        <p className="mt-2 text-primary-200">Selamat datang di dasbor PAM Desa Anda.</p>
        {user.email && (
          <p className="mt-1 text-primary-200 text-sm">Email: {user.email}</p>
        )}
        <p className="mt-1 text-primary-200 text-sm">No. Pelanggan: {user.customerNumber}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Tagihan Berikutnya" className="bg-white">
          {unpaidBill ? (
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Periode</span>
                <span className="font-semibold text-slate-800">{unpaidBill.period}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Jatuh Tempo</span>
                <span className="font-semibold text-red-600">{new Date(unpaidBill.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="text-center mt-4 py-4 border-t border-slate-200">
                <p className="text-slate-500">Total Tagihan</p>
                <p className="text-4xl font-bold text-primary-600">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(unpaidBill.totalAmount)}
                </p>
              </div>
              <Button onClick={() => setActiveView('bills')} className="w-full" size="lg">Bayar Sekarang</Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800">Semua Tagihan Lunas</h3>
              <p className="text-slate-500 mt-1">Terima kasih atas pembayaran tepat waktu Anda!</p>
            </div>
          )}
        </Card>
        
        <div className="space-y-6">
            <Card title="Aksi Cepat">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setActiveView('bills')} className="text-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition">
                        <BillIcon className="w-10 h-10 mx-auto text-primary-600 mb-2"/>
                        <p className="font-semibold text-slate-700">Lihat Semua Tagihan</p>
                    </button>
                    <button onClick={() => setActiveView('usage')} className="text-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition">
                        <ChartIcon className="w-10 h-10 mx-auto text-primary-600 mb-2"/>
                        <p className="font-semibold text-slate-700">Cek Grafik Pakai</p>
                    </button>
                    <button onClick={() => setActiveView('report')} className="col-span-1 sm:col-span-2 text-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition">
                        <ExclamationTriangleIcon className="w-10 h-10 mx-auto text-red-600 mb-2"/>
                        <p className="font-semibold text-red-700">Lapor Gangguan Air</p>
                    </button>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;
