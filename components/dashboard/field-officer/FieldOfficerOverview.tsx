import React, { useState, useEffect, useContext } from 'react';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { getAssignedReports } from '../../../services/api';
import { AuthContext } from '../../../App';
import { ProblemReport, ReportStatus } from '../../../types';
import { ExclamationTriangleIcon, CheckCircleIcon } from '../../icons';

const StatCard = ({ icon, title, value, colorClass }: { 
  icon: React.ReactNode; 
  title: string; 
  value: number; 
  colorClass: string; 
}) => (
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

const FieldOfficerOverview: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ inProgress: 0, completed: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getAssignedReports(user.id)
                .then((reports) => {
                    const inProgress = reports.filter(r => r.status === ReportStatus.DIPROSES).length;
                    const completed = reports.filter(r => r.status === ReportStatus.SELESAI).length;
                    setStats({ inProgress, completed });
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching assigned reports for overview:', error);
                    setStats({ inProgress: 0, completed: 0 });
                    setLoading(false);
                });
        }
    }, [user]);

    if (!user) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="p-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl shadow-lg text-white">
                    <h2 className="text-3xl font-bold">Halo, Petugas {user.name}!</h2>
                    <p className="mt-2 text-slate-300">Berikut adalah ringkasan tugas Anda.</p>
                    {user.email && (
                        <p className="mt-1 text-slate-300 text-sm">Email: {user.email}</p>
                    )}
                    <p className="mt-1 text-slate-300 text-sm">No. Petugas: {user.customerNumber}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="flex items-center p-4">
                        <div className="p-3 rounded-full mr-4 bg-yellow-500">
                            <ExclamationTriangleIcon className="w-6 h-6 text-white"/>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Tugas Dalam Proses</p>
                            <div className="flex justify-center p-2">
                                <Spinner size="sm" />
                            </div>
                        </div>
                    </Card>
                    <Card className="flex items-center p-4">
                        <div className="p-3 rounded-full mr-4 bg-green-500">
                            <CheckCircleIcon className="w-6 h-6 text-white"/>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Tugas Selesai</p>
                            <div className="flex justify-center p-2">
                                <Spinner size="sm" />
                            </div>
                        </div>
                    </Card>
                </div>
                <Card title="Selamat Bekerja!">
                    <p className="text-slate-500 text-center py-8">
                       Pilih "Tugas Laporan" dari menu untuk melihat dan memperbarui daftar tugas Anda.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="p-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl shadow-lg text-white">
                <h2 className="text-3xl font-bold">Halo, Petugas {user.name}!</h2>
                <p className="mt-2 text-slate-300">Berikut adalah ringkasan tugas Anda.</p>
                {user.email && (
                    <p className="mt-1 text-slate-300 text-sm">Email: {user.email}</p>
                )}
                <p className="mt-1 text-slate-300 text-sm">No. Petugas: {user.customerNumber}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard icon={<ExclamationTriangleIcon className="w-6 h-6 text-white"/>} title="Tugas Dalam Proses" value={stats.inProgress} colorClass="bg-yellow-500"/>
                <StatCard icon={<CheckCircleIcon className="w-6 h-6 text-white"/>} title="Tugas Selesai" value={stats.completed} colorClass="bg-green-500"/>
            </div>
             <Card title="Selamat Bekerja!">
                <p className="text-slate-500 text-center py-8">
                   Pilih "Tugas Laporan" dari menu untuk melihat dan memperbarui daftar tugas Anda.
                </p>
             </Card>
        </div>
    );
};

export default FieldOfficerOverview;
