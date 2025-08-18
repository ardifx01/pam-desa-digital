import React from 'react';
import { Bill, User } from '../../../types';
import { WaterDropIcon } from './UserOverview';

interface BillReceiptProps {
  bill: Bill;
  user: User;
}

const BillReceipt: React.FC<BillReceiptProps> = ({ bill, user }) => {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    }
    
  return (
    <div className="p-6 bg-white text-slate-800 font-sans">
      <header className="flex justify-between items-center pb-4 border-b-2 border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PAM Desa Digital</h1>
          <p className="text-sm text-slate-500">Bukti Pembayaran Rekening Air</p>
        </div>
        <WaterDropIcon className="w-12 h-12 text-primary-600" />
      </header>
      
      <section className="grid grid-cols-2 gap-8 my-6 text-sm">
        <div>
          <h3 className="font-semibold mb-2 text-slate-600">DIBAYARKAN KEPADA:</h3>
          <p className="font-bold">Admin PAM Desa</p>
          <p>Kantor Desa</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-slate-600">PELANGGAN:</h3>
          <p className="font-bold">{user.name}</p>
          <p>{user.address}</p>
          <p>No. Pelanggan: {user.customerNumber}</p>
          {user.email && (
            <p>Email: {user.email}</p>
          )}
        </div>
      </section>

      <section className="my-6">
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left font-semibold">Deskripsi</th>
                <th className="p-3 text-right font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-3">Tagihan Air Periode {bill.period}</td>
                <td className="p-3 text-right"></td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 pl-8 text-slate-500">Meteran Awal - Akhir</td>
                <td className="p-3 text-right">{bill.lastReading} m³ - {bill.currentReading} m³</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 pl-8 text-slate-500">Total Pemakaian</td>
                <td className="p-3 text-right">{bill.usage} m³</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 pl-8 text-slate-500">Pemakaian ({bill.usage} m³ x {formatCurrency(bill.ratePerM3)})</td>
                <td className="p-3 text-right">{formatCurrency(bill.usage * bill.ratePerM3)}</td>
              </tr>
               <tr className="border-b border-slate-200">
                <td className="p-3 pl-8 text-slate-500">Biaya Administrasi</td>
                <td className="p-3 text-right">{formatCurrency(bill.adminFee)}</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-100 font-bold">
              <tr>
                <td className="p-3 text-right">Total Pembayaran</td>
                <td className="p-3 text-right text-lg">{formatCurrency(bill.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-8 my-6 text-sm">
        <div>
          <p>Tanggal Bayar: {bill.paidDate ? new Date(bill.paidDate).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : '-'}</p>
          <p>ID Transaksi: {bill.id}</p>
        </div>
        <div className="text-center">
            <p className="text-3xl font-bold text-green-600 transform -rotate-12">LUNAS</p>
        </div>
      </section>
      
      <footer className="pt-4 mt-6 border-t border-slate-300 text-center text-xs text-slate-500">
        <p>Terima kasih atas pembayaran Anda. Simpan nota ini sebagai bukti pembayaran yang sah.</p>
      </footer>
    </div>
  );
};

export default BillReceipt;
