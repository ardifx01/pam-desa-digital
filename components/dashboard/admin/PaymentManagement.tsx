import React, { useState, useEffect, useMemo } from 'react';
import { Bill, User } from '../../../types';
import { getAllUsers, getAllBills, payBill } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { Button } from '../../ui/Button';
import { CheckCircleIcon } from '../../icons';

const PaymentManagement: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [payingBillId, setPayingBillId] = useState<string | null>(null);

  const fetch_data = () => {
      setLoading(true);
      Promise.all([getAllBills(), getAllUsers()]).then(([allBills, allUsers]) => {
      setBills(allBills.filter(b => b.status === 'unpaid'));
      setUsers(allUsers);
      setLoading(false);
    });
  }
  
  useEffect(() => {
    fetch_data();
  }, []);
  
  const userMap = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, User>);
  }, [users]);
  
  const filteredBills = useMemo(() => {
    if (!searchTerm) return bills;
    return bills.filter(bill => {
      const user = userMap[bill.userId];
      return user && (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.customerNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [bills, searchTerm, userMap]);

  const handleConfirmPayment = (billId: string) => {
    setPayingBillId(billId);
    payBill(billId).then(() => {
      // Refresh data
      fetch_data();
      setPayingBillId(null);
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  return (
    <Card title="Konfirmasi Pembayaran Tagihan">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama atau nomor pelanggan..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="block w-full max-w-sm px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      {loading ? (
        <div className="flex justify-center p-8"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pelanggan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Periode</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tagihan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jatuh Tempo</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {filteredBills.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-500">Tidak ada tagihan yang belum dibayar.</td></tr>
                ) : filteredBills.map(bill => {
                const user = userMap[bill.userId];
                return (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{user?.name || 'N/A'}</div>
                        <div className="text-sm text-slate-500">{user?.customerNumber || 'N/A'}</div>
                        {user?.email && (
                            <div className="text-sm text-slate-500">{user.email}</div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{bill.period}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{formatCurrency(bill.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{new Date(bill.dueDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Button 
                            size="sm" 
                            onClick={() => handleConfirmPayment(bill.id)}
                            isLoading={payingBillId === bill.id}
                            leftIcon={payingBillId !== bill.id ? <CheckCircleIcon className="w-4 h-4" /> : null}
                        >
                            Konfirmasi Bayar
                        </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default PaymentManagement;
