import React, { useState, useEffect, useContext } from 'react';
import { ProblemReport, ReportStatus } from '../../../types';
import { getAssignedReports, updateProblemReport } from '../../../services/api';
import { AuthContext } from '../../../App';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';

const ReportAssignments: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = React.useCallback(() => {
    if (user) {
        setLoading(true);
        getAssignedReports(user.id)
          .then(data => {
              setReports(data);
              setLoading(false);
          })
          .catch(error => {
              console.error('Error fetching assigned reports:', error);
              setReports([]);
              setLoading(false);
          });
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);
  
  const handleStatusChange = (reportId: string, status: ReportStatus) => {
    updateProblemReport(reportId, { status }).then(() => {
        setReports(prev => prev.map(r => r.id === reportId ? {...r, status} : r));
    });
  }

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
        case ReportStatus.BARU: return 'bg-blue-100 text-blue-800';
        case ReportStatus.DIPROSES: return 'bg-yellow-100 text-yellow-800';
        case ReportStatus.SELESAI: return 'bg-green-100 text-green-800';
    }
  }

  return (
    <Card title="Daftar Tugas Laporan Anda">
      {loading ? (
        <div className="flex justify-center p-4">
          <Spinner size="sm" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Tidak Ada Tugas</h3>
          <p className="text-slate-500">Anda tidak memiliki laporan yang ditugaskan saat ini.</p>
          <p className="text-sm text-slate-400 mt-2">Admin akan menugaskan laporan baru untuk Anda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                <div className="mb-2 sm:mb-0">
                    <h4 className="text-lg font-semibold text-slate-800">{report.title}</h4>
                    <p className="text-sm text-slate-500">
                        Dilaporkan pada: {new Date(report.reportedAt).toLocaleString('id-ID')}
                    </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                    {report.status}
                </span>
              </div>
              <p className="mt-2 text-slate-600">{report.description}</p>
              <p className="mt-1 text-sm text-slate-500"><strong>Lokasi:</strong> {report.location}</p>
              {report.photoUrl && <img src={report.photoUrl} alt="Problem" className="mt-2 rounded-lg max-h-48 w-auto" />}

              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Perbarui Status:</label>
                <select
                    value={report.status}
                    onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                    disabled={report.status === ReportStatus.SELESAI}
                    className="text-sm rounded-md border-slate-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                    <option value={ReportStatus.DIPROSES}>Dalam Proses</option>
                    <option value={ReportStatus.SELESAI}>Selesai</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ReportAssignments;
