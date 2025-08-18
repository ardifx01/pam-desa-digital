
import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { getAllUsers, getAllProblemReports, getAllTariffs } from '../../../services/api';
import { UsersIcon, ExclamationTriangleIcon, MoneyIcon } from '../../icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ReportStatus, User, UserRole } from '../../../types';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, colorClass }) => (
    <Card className="flex items-center p-4">
      <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </Card>
  );

const AdminOverview: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, reports: 0, tariffs: 0 });
    const [loading, setLoading] = useState(true);
    const [reportChartData, setReportChartData] = useState<Array<{ name: string; value: number }>>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            getAllUsers(),
            getAllProblemReports(),
            getAllTariffs()
        ]).then(([usersData, reportsData, tariffsData]) => {
            setUsers(usersData);
            setReports(reportsData);
            setStats({
                users: usersData.length,
                reports: reportsData.filter(r => r.status !== ReportStatus.SELESAI).length,
                tariffs: tariffsData.length
            });

            const reportStatusCounts: Record<string, number> = reportsData.reduce((acc, report) => {
                acc[report.status] = (acc[report.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            setReportChartData([
                { name: ReportStatus.BARU, value: reportStatusCounts[ReportStatus.BARU] || 0 },
                { name: ReportStatus.DIPROSES, value: reportStatusCounts[ReportStatus.DIPROSES] || 0 },
                { name: ReportStatus.SELESAI, value: reportStatusCounts[ReportStatus.SELESAI] || 0 },
            ]);

            setLoading(false);
        });
    }, []);

    if(loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>
    }

    const COLORS: Record<string, string> = {
        [ReportStatus.BARU]: '#3b82f6',
        [ReportStatus.DIPROSES]: '#f59e0b',
        [ReportStatus.SELESAI]: '#22c55e',
    };

    const getStatusBadge = (status: ReportStatus) => {
        switch (status) {
            case ReportStatus.BARU: return 'bg-blue-100 text-blue-800';
            case ReportStatus.DIPROSES: return 'bg-yellow-100 text-yellow-800';
            case ReportStatus.SELESAI: return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Ringkasan Sistem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<UsersIcon className="w-6 h-6 text-white"/>} title="Total Pengguna" value={stats.users} colorClass="bg-blue-500"/>
                <StatCard icon={<ExclamationTriangleIcon className="w-6 h-6 text-white"/>} title="Laporan Aktif" value={stats.reports} colorClass="bg-yellow-500"/>
                <StatCard icon={<MoneyIcon className="w-6 h-6 text-white"/>} title="Jenis Tarif" value={stats.tariffs} colorClass="bg-green-500"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <Card title="Analisis Keuangan (Simulasi)">
                    <div className="h-80">
                      {/* Placeholder for finance chart */}
                      <p className="text-slate-500 text-center pt-16">Grafik laporan keuangan akan ditampilkan di sini.</p>
                    </div>
                  </Card>
                </div>
                <div className="lg:col-span-2">
                  <Card title="Status Laporan Masalah">
                    <div className="h-80 w-full">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={reportChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {reportChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Pengguna Terbaru">
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                          <p className="text-sm text-slate-500 truncate">{user.phoneNumber}</p>
                          {user.email && (
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          )}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' :
                          user.role === UserRole.FIELD_OFFICER ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role === UserRole.ADMIN ? 'Admin' :
                           user.role === UserRole.FIELD_OFFICER ? 'Petugas Lapangan' : 'Pengguna'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Laporan Masalah Terbaru">
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <div key={report.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{report.title}</p>
                            <p className="text-sm text-slate-500 truncate">{report.location}</p>
                            <p className="text-xs text-slate-400">{new Date(report.reportedAt).toLocaleDateString('id-ID')}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
        </div>
    );
};

export default AdminOverview;
