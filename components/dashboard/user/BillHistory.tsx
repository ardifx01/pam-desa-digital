import React, { useState, useEffect, useContext, Fragment } from 'react';
import { AuthContext } from '../../../App';
import { Bill } from '../../../types';
import { getUserBills } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { CheckCircleIcon, XCircleIcon, PrinterIcon, ChevronDownIcon } from '../../icons';
import { Dialog, Transition } from '@headlessui/react';
import BillReceipt from './BillReceipt';

const BillHistory: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);
  const [billToPrint, setBillToPrint] = useState<Bill | null>(null);

  const fetchBills = React.useCallback(() => {
    if (user) {
      setLoading(true);
      getUserBills(user.id)
        .then(data => {
          setBills(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching bills:', error);
          setBills([]);
          setLoading(false);
        });
    }
  }, [user]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const toggleDetails = (billId: string) => {
    setExpandedBillId(expandedBillId === billId ? null : billId);
  };

  const handlePrint = () => {
    const printElement = document.getElementById('printable-receipt');
    if (!printElement) {
      console.error('Element with ID "printable-receipt" not found.');
      return;
    }

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
      
      // Copy all link and style tags from parent
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
      }, 500); // Delay to ensure styles are loaded
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  return (
    <>
      <Card title="Riwayat Tagihan Air">
        {loading ? (
          <div className="flex justify-center p-4">
            <Spinner size="sm" />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Belum Ada Tagihan</h3>
            <p className="text-slate-500">Tagihan air akan muncul di sini setelah admin membuat tagihan baru.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                        <p className="font-semibold text-slate-800 text-lg">{bill.period}</p>
                        <p className="text-slate-500 text-sm">Jatuh tempo: {new Date(bill.dueDate).toLocaleDateString('id-ID')}</p>
                        {user?.email && (
                            <p className="text-slate-500 text-sm">Email: {user.email}</p>
                        )}
                    </div>
                    <div className="flex-1 flex items-center justify-start md:justify-center">
                        {bill.status === 'paid' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="w-5 h-5 mr-2" /> Lunas
                        </span>
                        ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <XCircleIcon className="w-5 h-5 mr-2" /> Belum Lunas
                        </span>
                        )}
                    </div>
                    <div className="flex-1 flex items-center justify-start md:justify-end mt-4 md:mt-0 space-x-2">
                        {bill.status === 'paid' ? (
                            <Button size="sm" variant="secondary" onClick={() => setBillToPrint(bill)} leftIcon={<PrinterIcon className="w-4 h-4"/>}>
                                Cetak Nota
                            </Button>
                        ) : null}
                         <Button size="sm" variant="ghost" onClick={() => toggleDetails(bill.id)} rightIcon={<ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedBillId === bill.id ? 'rotate-180' : ''}`}/>}>
                            Rincian
                        </Button>
                    </div>
                </div>

                {expandedBillId === bill.id && (
                  <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <h4 className="font-semibold text-slate-700 mb-2">Rincian Tagihan</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Periode</span><span className="font-medium text-slate-800">{bill.period}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Meteran Awal</span><span className="font-medium text-slate-800">{bill.lastReading} m³</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Meteran Akhir</span><span className="font-medium text-slate-800">{bill.currentReading} m³</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Total Pemakaian</span><span className="font-medium text-slate-800">{bill.usage} m³</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Tarif per m³</span><span className="font-medium text-slate-800">{formatCurrency(bill.ratePerM3)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Biaya Admin</span><span className="font-medium text-slate-800">{formatCurrency(bill.adminFee)}</span></div>
                      <div className="flex justify-between pt-2 border-t mt-2 border-slate-300"><span className="font-bold text-slate-800">Total Tagihan</span><span className="font-bold text-primary-600 text-base">{formatCurrency(bill.totalAmount)}</span></div>
                    </div>
                    {bill.status === 'unpaid' && (
                        <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
                            Silakan lakukan pembayaran ke kantor PAM Desa atau melalui petugas lapangan untuk melunasi tagihan ini.
                        </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      
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
                     <Button onClick={handlePrint} leftIcon={<PrinterIcon className="w-4 h-4"/>}>Cetak</Button>
                  </Dialog.Title>
                  <div className="mt-4" id="printable-receipt">
                    {billToPrint && user && <BillReceipt bill={billToPrint} user={user} />}
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

      <div id="print-mount-point" className="hidden"></div>
    </>
  );
};

export default BillHistory;