
import React, { useState, useEffect } from 'react';
import { ProblemReport, ReportStatus, User, UserRole } from '../../../types';
import { getAllProblemReports, updateProblemReport, getAllUsers } from '../../../services/api';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { Button } from '../../ui/Button';

const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fieldOfficers, setFieldOfficers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    
    Promise.all([
        getAllProblemReports(),
        getAllUsers()
    ]).then(([reportsData, usersData]) => {
      // Filter hanya laporan yang userId-nya masih ada di koleksi users
      const validUserIds = new Set(usersData.map(u => u.id));
      const filteredReports = reportsData.filter(r => validUserIds.has(r.userId));

      setReports(filteredReports);
      setUsers(usersData);
      setFieldOfficers(usersData.filter(u => u.role === UserRole.FIELD_OFFICER));
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan refresh halaman.');
      setReports([]);
      setUsers([]);
      setFieldOfficers([]);
      setLoading(false);
    });
  }, []);
  
  const findUser = (userId: string) => users.find(u => u.id === userId);

  const handleUpdate = (reportId: string, data: Partial<ProblemReport>) => {
    updateProblemReport(reportId, data).then(updatedReport => {
        setReports(prevReports => prevReports.map(r => r.id === reportId ? updatedReport : r));
    }).catch(error => {
        console.error('Error updating report:', error);
        alert('Gagal memperbarui laporan. Silakan coba lagi.');
    });
  }

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
        case ReportStatus.BARU: return 'bg-blue-100 text-blue-800';
        case ReportStatus.DIPROSES: return 'bg-yellow-100 text-yellow-800';
        case ReportStatus.SELESAI: return 'bg-green-100 text-green-800';
    }
  }

  if (loading) {
    return (
      <Card title="Manajemen Laporan Masalah">
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Manajemen Laporan Masalah">
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Terjadi Kesalahan</h3>
          <p className="text-slate-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm">
            Refresh Halaman
          </Button>
        </div>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card title="Manajemen Laporan Masalah">
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Belum Ada Laporan</h3>
          <p className="text-slate-500">Saat ini tidak ada laporan masalah air yang masuk.</p>
          <p className="text-sm text-slate-400 mt-2">Laporan akan muncul di sini setelah pengguna melaporkan masalah.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Manajemen Laporan Masalah">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Total Laporan:</strong> {reports.length} | 
          <strong>Field Officers:</strong> {fieldOfficers.length} | 
          <strong>Pengguna Aktif:</strong> {users.filter(u => u.role === UserRole.USER).length}
        </p>
      </div>
      
      <div className="space-y-4">
        {reports.map(report => {
          const reportUser = findUser(report.userId);
          const assignee = report.assigneeId ? findUser(report.assigneeId) : null;
          
          return (
            <div key={report.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div className="mb-2 sm:mb-0">
                    <h4 className="text-lg font-semibold text-slate-800">{report.title}</h4>
                    <p className="text-sm text-slate-500">
                        Dari: <strong>{reportUser?.name || 'Pengguna Tidak Ditemukan'}</strong> | 
                        Dilaporkan: {new Date(report.reportedAt).toLocaleString('id-ID')}
                    </p>
                    {reportUser?.email && (
                        <p className="text-sm text-slate-500">
                            Email: {reportUser.email}
                        </p>
                    )}
                    {reportUser?.phoneNumber && (
                        <p className="text-sm text-slate-500">
                            Telepon: {reportUser.phoneNumber}
                        </p>
                    )}
                    {assignee && (
                        <p className="text-sm text-slate-500">
                            Ditugaskan ke: <strong className="text-primary-600">{assignee.name}</strong>
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                        {report.status}
                    </span>
                </div>
              </div>
              <p className="mt-2 text-slate-600">{report.description}</p>
              <p className="mt-1 text-sm text-slate-500"><strong>Lokasi:</strong> {report.location}</p>
              {report.photoUrl && <img src={report.photoUrl} alt="Problem" className="mt-2 rounded-lg max-h-48 w-auto" />}

              <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto">
                    <label className="text-sm font-medium text-slate-700 mr-2">Ubah Status:</label>
                    <select
                        value={report.status}
                        onChange={(e) => handleUpdate(report.id, { status: e.target.value as ReportStatus })}
                        className="text-sm rounded-md border-slate-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                        {Object.values(ReportStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="w-full sm:w-auto">
                    <label className="text-sm font-medium text-slate-700 mr-2">Tugaskan ke:</label>
                    <select
                        value={report.assigneeId || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const updateData = value ? { assigneeId: value } : { assigneeId: undefined };
                          handleUpdate(report.id, updateData);
                        }}
                        className="text-sm rounded-md border-slate-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    >
                        <option value="">-- Belum Ditugaskan --</option>
                        {fieldOfficers.map(fo => <option key={fo.id} value={fo.id}>{fo.name}</option>)}
                    </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ReportManagement;
