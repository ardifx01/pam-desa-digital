
import React, { useState, useEffect, useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../../../App';
import { Bill } from '../../../types';
import { getUserBills } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';

const UsageGraph: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserBills(user.id)
        .then(bills => {
          const sortedBills = bills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(a.dueDate).getTime());
          const data = sortedBills.map(bill => ({
            name: bill.period.split(' ')[0].substring(0,3), // "Jan", "Feb", etc.
            'Konsumsi (m³)': bill.usage,
          }));
          setChartData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching bills for usage graph:', error);
          setChartData([]);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return (
      <Card title="Grafik Konsumsi Air">
        <div className="flex justify-center items-center h-32">
          <Spinner size="sm" />
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card title="Grafik Konsumsi Air">
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Belum Ada Data Konsumsi</h3>
          <p className="text-slate-500">Grafik konsumsi air akan muncul setelah ada data tagihan.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Grafik Konsumsi Air Bulanan">
      <div className="h-96 w-full">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748b' }}/>
            <YAxis unit=" m³" tick={{ fill: '#64748b' }}/>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            <Bar dataKey="Konsumsi (m³)" fill="#3b82f6" barSize={40} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {user.email && (
        <div className="mt-4 text-center text-sm text-slate-500">
          <p>Email: {user.email}</p>
        </div>
      )}
    </Card>
  );
};

export default UsageGraph;
