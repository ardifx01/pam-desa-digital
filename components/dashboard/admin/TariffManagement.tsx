
import React, { useState, useEffect } from 'react';
import { Tariff } from '../../../types';
import { getAllTariffs, updateTariff } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { Button } from '../../ui/Button';

const TariffManagement: React.FC = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);

  useEffect(() => {
    fetchTariffs();
  }, []);

  const fetchTariffs = () => {
    setLoading(true);
    getAllTariffs().then(data => {
      setTariffs(data);
      setLoading(false);
    });
  };

  const handleEdit = (tariff: Tariff) => {
    setEditingTariff({ ...tariff });
  };

  const handleSave = () => {
    if (!editingTariff) return;
    updateTariff(editingTariff.id, editingTariff).then(() => {
      fetchTariffs();
      setEditingTariff(null);
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  return (
    <Card title="Manajemen Tarif Air">
      {loading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {tariffs.map(tariff => (
            <div key={tariff.id} className="p-4 border border-slate-200 rounded-lg">
              {editingTariff && editingTariff.id === tariff.id ? (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Nama Tarif</label>
                        <input type="text" value={editingTariff.name} onChange={e => setEditingTariff({...editingTariff, name: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Tarif per m³</label>
                        <input type="number" value={editingTariff.ratePerM3} onChange={e => setEditingTariff({...editingTariff, ratePerM3: +e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Biaya Admin</label>
                        <input type="number" value={editingTariff.adminFee} onChange={e => setEditingTariff({...editingTariff, adminFee: +e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm"/>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={() => setEditingTariff(null)}>Batal</Button>
                        <Button onClick={handleSave}>Simpan</Button>
                    </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">{tariff.name}</h3>
                        <p className="text-slate-600">Tarif/m³: {formatCurrency(tariff.ratePerM3)} | Biaya Admin: {formatCurrency(tariff.adminFee)}</p>
                        <p className="text-sm text-slate-500">{tariff.description}</p>
                    </div>
                    <Button variant="ghost" onClick={() => handleEdit(tariff)}>Ubah</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TariffManagement;
