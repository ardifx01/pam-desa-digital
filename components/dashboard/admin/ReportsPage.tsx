import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { getAllBills, getAllUsers, getUserById } from '../../../services/api';
import { Bill, User } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '../../ui/Button';
import { PrinterIcon } from '../../icons';
import BillReceipt from '../user/BillReceipt';
import { Dialog, Transition } from '@headlessui/react';

type MonthlyData = {
    name: string;
    Pendapatan: number;
    Konsumsi: number;
};

const ReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('finance');
    const [bills, setBills] = useState<Bill[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    // Tambahkan state untuk dialog cetak nota
    const [billToPrint, setBillToPrint] = useState<Bill | null>(null);
    const [userForPrint, setUserForPrint] = useState<User | null>(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getAllBills(),
            getAllUsers()
        ]).then(async ([billsData, usersData]) => {
            // Lengkapi data pengguna yang mungkin tidak ada namun direferensikan oleh bill
            const existingIds = new Set(usersData.map(u => u.id));
            const missingUserIds = Array.from(new Set(billsData.map(b => b.userId).filter(id => !existingIds.has(id))));
            if (missingUserIds.length > 0) {
                const fetched = await Promise.all(missingUserIds.map(id => getUserById(id)));
                const found = fetched.filter((u): u is NonNullable<typeof u> => Boolean(u));
                usersData = usersData.concat(found);
            }
            setBills(billsData);
            setUsers(usersData);
            setLoading(false);
        });
    }, []);

    const { monthlyData, financialSummary, consumptionSummary, paidBills, userMap, hasValidConsumption } = useMemo(() => {
        const data: { [key: string]: { revenue: number, consumption: number } } = {};
        
        const userMap = users.reduce((acc: Record<string, User>, user: User) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, User>);
        
        const paidBills = bills.filter((b: Bill) => b.status === 'paid' && userMap[b.userId]?.customerNumber);
        const consumptionBills = bills.filter((b: Bill) => userMap[b.userId]?.customerNumber);

        paidBills.forEach((bill: Bill) => {
            const paidDate = bill.paidDate ? new Date(bill.paidDate) : new Date();
            const monthYear = paidDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
            if (!data[monthYear]) {
                data[monthYear] = { revenue: 0, consumption: 0 };
            }
            data[monthYear].revenue += bill.totalAmount;
        });

        consumptionBills.forEach((bill: Bill) => {
            const [monthStr, yearStr] = bill.period.split(' ');
            const monthIndex = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].indexOf(monthStr);
            if (monthIndex === -1) return;
            const billDate = new Date(parseInt(yearStr), monthIndex, 1);
            const monthYear = billDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
            
            if (!data[monthYear]) {
                data[monthYear] = { revenue: 0, consumption: 0 };
            }
            data[monthYear].consumption += bill.usage;
        });
        
        const sortedMonths = Object.keys(data).sort((a: string, b: string) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            const dateA = new Date(`${monthA} 1, ${yearA}`);
            const dateB = new Date(`${monthB} 1, ${yearB}`);
            return dateA.getTime() - dateB.getTime();
        });

        const monthlyData: MonthlyData[] = sortedMonths.map((key: string) => ({
            name: key,
            Pendapatan: data[key].revenue,
            Konsumsi: data[key].consumption
        })).slice(-6); // Last 6 months

        const totalRevenue = paidBills.reduce((acc: number, bill: Bill) => acc + bill.totalAmount, 0);
        const thisMonthRevenue = data[new Date().toLocaleString('id-ID', { month: 'short', year: 'numeric' })]?.revenue || 0;
        
        const totalConsumption = consumptionBills.reduce((acc: number, bill: Bill) => acc + bill.usage, 0);
        const thisMonthPeriod = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        const thisMonthConsumption = consumptionBills.filter((b: Bill) => b.period === thisMonthPeriod).reduce((acc: number, bill: Bill) => acc + bill.usage, 0);
        const hasValidConsumption = consumptionBills.length > 0;

        return {
            monthlyData,
            financialSummary: { totalRevenue, thisMonthRevenue },
            consumptionSummary: { totalConsumption, thisMonthConsumption },
            paidBills,
            userMap,
            hasValidConsumption
        };

    }, [bills, users]);
    
    const handlePrintNota = (bill: Bill, user: User) => {
      setBillToPrint(bill);
      setUserForPrint(user);
    };

    const handlePrint = () => {
        const reportId = activeTab === 'finance' ? 'finance-report-content' : 'consumption-report-content';
        const reportTitle = activeTab === 'finance' ? 'Laporan Keuangan' : 'Laporan Konsumsi Air';
        const reportElement = document.getElementById(reportId);
    
        if (!reportElement) {
          console.error(`Element with ID "${reportId}" not found.`);
          return;
        }
    
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
    
        document.body.appendChild(iframe);
    
        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write('<html><head><title>Cetak Laporan</title>');
          
          const headElements = document.head.querySelectorAll('link, style');
          headElements.forEach(el => {
            iframeDoc.head.appendChild(el.cloneNode(true));
          });
          
          iframeDoc.write('</head><body class="bg-white">');
          const printContent = `
            <div class="print-container p-8 font-sans">
              <h1 class="text-2xl font-bold mb-2 text-slate-800">${reportTitle}</h1>
              <p class="text-sm text-slate-500 mb-6">Dicetak pada: ${new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
              ${reportElement.innerHTML}
            </div>
          `;
          iframeDoc.write(printContent);
          iframeDoc.write('</body></html>');
          iframeDoc.close();
    
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } catch (e) {
              console.error("Printing failed:", e);
            } finally {
              document.body.removeChild(iframe);
            }
          }, 500);
        }
      };

    const handlePrintNotaReceipt = () => {
      const printElement = document.getElementById('printable-receipt-admin');
      if (!printElement) return;
      const printContent = printElement.innerHTML;
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-1000px';
      iframe.style.left = '-1000px';
      document.body.appendChild(iframe);
      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write('<html><head><title>Cetak Nota</title>');
        const headElements = document.head.querySelectorAll('link, style');
        headElements.forEach(el => {
          iframeDoc.head.appendChild(el.cloneNode(true));
        });
        iframeDoc.write('</head><body class="bg-white">');
        iframeDoc.write(printContent);
        iframeDoc.write('</body></html>');
        iframeDoc.close();
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error("Printing failed:", e);
          } finally {
            document.body.removeChild(iframe);
          }
        }, 500);
      }
    };
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const renderFinanceReport = () => (
        <div className="space-y-6" id="finance-report-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Total Pendapatan (Semua Waktu)">
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(financialSummary.totalRevenue)}</p>
                </Card>
                <Card title="Pendapatan Bulan Ini">
                     <p className="text-3xl font-bold text-green-600">{formatCurrency(financialSummary.thisMonthRevenue)}</p>
                </Card>
            </div>
            <Card title="Grafik Pendapatan 6 Bulan Terakhir">
                <div className="h-80 w-full">
                    <ResponsiveContainer>
                        <BarChart data={monthlyData} margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(value as number)} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar dataKey="Pendapatan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <Card title="Rincian Transaksi Lunas">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Tgl. Bayar</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Periode</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">No. Pelanggan</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Jumlah</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {paidBills
                              .filter(bill => userMap[bill.userId]?.customerNumber) // Filter lagi untuk memastikan hanya yang punya customerNumber
                              .sort((a,b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
                              .map(bill => (
                                <tr key={bill.id}>
                                    <td className="px-4 py-2 text-sm whitespace-nowrap">{new Date(bill.paidDate!).toLocaleDateString('id-ID')}</td>
                                    <td className="px-4 py-2 text-sm whitespace-nowrap">{bill.period}</td>
                                    <td className="px-4 py-2 text-sm whitespace-nowrap">
                                        <div>{userMap[bill.userId]?.customerNumber ?? '—'}</div>
                                        <div className="text-xs text-slate-500">{userMap[bill.userId]?.name ?? 'Pengguna Tidak Ditemukan'}</div>
                                        {userMap[bill.userId]?.email && (
                                            <div className="text-xs text-slate-400">{userMap[bill.userId]?.email}</div>
                                        )}
                                        {!userMap[bill.userId] && (
                                            <div className="text-[10px] text-slate-400">ID: {bill.userId}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-right font-semibold whitespace-nowrap">{formatCurrency(bill.totalAmount)}</td>
                                    <td className="px-4 py-2 text-center">
                                      <Button size="sm" variant="secondary" onClick={() => handlePrintNota(bill, userMap[bill.userId])}>
                                        Cetak Nota
                                      </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );

    const renderConsumptionReport = () => (
         <div className="space-y-6" id="consumption-report-content">
            {hasValidConsumption ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Total Konsumsi (Semua Waktu)">
                        <p className="text-3xl font-bold text-primary-600">{consumptionSummary.totalConsumption.toLocaleString('id-ID')} m³</p>
                    </Card>
                    <Card title="Konsumsi Bulan Ini">
                         <p className="text-3xl font-bold text-primary-600">{consumptionSummary.thisMonthConsumption.toLocaleString('id-ID')} m³</p>
                    </Card>
                </div>
                <Card title="Grafik Konsumsi Air 6 Bulan Terakhir">
                    <div className="h-80 w-full">
                        <ResponsiveContainer>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis unit=" m³"/>
                                <Tooltip formatter={(value) => `${value} m³`} />
                                <Legend />
                                <Bar dataKey="Konsumsi" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
              </>
            ) : (
              <Card title="Konsumsi Air">
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Tidak Ada Data Konsumsi</h3>
                  <p className="text-slate-500">Tidak ada tagihan yang terkait dengan pengguna aktif.</p>
                  <p className="text-sm text-slate-400 mt-2">Data konsumsi akan muncul setelah ada tagihan dari pengguna yang terdaftar.</p>
                </div>
              </Card>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <div className="border-b border-gray-200 flex justify-between items-center">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('finance')} className={`${activeTab === 'finance' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Laporan Keuangan
                        </button>
                        <button onClick={() => setActiveTab('consumption')} className={`${activeTab === 'consumption' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Laporan Konsumsi
                        </button>
                    </nav>
                    <Button onClick={handlePrint} variant="secondary" leftIcon={<PrinterIcon className="w-5 h-5"/>}>
                        Cetak Laporan
                    </Button>
                </div>
            </div>

            {loading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                <div className="mt-6">
                    {activeTab === 'finance' && renderFinanceReport()}
                    {activeTab === 'consumption' && renderConsumptionReport()}
                </div>
            )}

            {/* Dialog/modal cetak nota */}
            <Transition appear show={billToPrint !== null} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={() => setBillToPrint(null)}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                      <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                          Nota Pembayaran
                          <Button onClick={handlePrintNotaReceipt} leftIcon={<PrinterIcon className="w-4 h-4"/>}>Cetak</Button>
                        </Dialog.Title>
                        <div className="mt-4" id="printable-receipt-admin">
                          {billToPrint && userForPrint && <BillReceipt bill={billToPrint} user={userForPrint} />}
                        </div>
                        <div className="mt-4">
                          <Button variant="secondary" onClick={() => setBillToPrint(null)}>Tutup</Button>
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

export default ReportsPage;