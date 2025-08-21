
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../App';
import { submitProblemReport, getUserReports } from '../../../services/api';
import { testFirebaseConnection } from '../../../services/firebase';
import { ProblemReport, ReportStatus } from '../../../types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';

const ReportProblem: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [firebaseStatus, setFirebaseStatus] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown');

  const testConnection = async () => {
    setFirebaseStatus('testing');
    try {
      const isConnected = await testFirebaseConnection();
      setFirebaseStatus(isConnected ? 'connected' : 'failed');
    } catch (error) {
      console.error('Connection test failed:', error);
      setFirebaseStatus('failed');
    }
  };

  const fetchReports = React.useCallback(() => {
    if (user) {
        setLoadingReports(true);
        getUserReports(user.id)
          .then(data => {
              setReports(data);
              setLoadingReports(false);
          })
          .catch(error => {
              console.error('Error fetching reports:', error);
              setReports([]);
              setLoadingReports(false);
          });
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error('No user found in context');
      setError('User tidak ditemukan. Silakan login ulang.');
      return;
    }
    
    // Validate required fields
    if (!title.trim()) {
      setError('Judul laporan harus diisi');
      return;
    }
    if (!description.trim()) {
      setError('Deskripsi harus diisi');
      return;
    }
    if (!location.trim()) {
      setError('Lokasi harus diisi');
      return;
    }
    
    console.log('Submitting report with user:', user);
    console.log('Report data:', { title, description, location, photo: photo?.name });
    
    setSubmitting(true);
    setError('');
    setSuccess(false);
    
    // In a real app, upload photo to Firebase Storage and get URL
    const photoUrl = photo ? URL.createObjectURL(photo) : undefined;
    
    try {
      const result = await submitProblemReport({
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        photoUrl,
      });
      console.log('Report submitted successfully:', result);
      setSuccess(true);
      setTitle('');
      setDescription('');
      setLocation('');
      setPhoto(null);
      fetchReports(); // Refresh list
    } catch (err) {
      console.error('Error submitting report:', err);
      if (err instanceof Error) {
        setError(`Gagal mengirim laporan: ${err.message}`);
      } else {
        setError('Gagal mengirim laporan. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
        case ReportStatus.BARU:
            return 'bg-blue-100 text-blue-800';
        case ReportStatus.DIPROSES:
            return 'bg-yellow-100 text-yellow-800';
        case ReportStatus.SELESAI:
            return 'bg-green-100 text-green-800';
    }
  }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <Card title="Form Laporan Masalah">
                {/* Debug Info - Remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs">
                    <strong>Debug Info:</strong><br/>
                    User ID: {user?.id || 'Not found'}<br/>
                    User Role: {user?.role || 'Not found'}<br/>
                    User Email: {user?.email || 'Not found'}<br/>
                    <br/>
                    <strong>Firebase Status:</strong> {firebaseStatus}<br/>
                    <button 
                      onClick={testConnection}
                      disabled={firebaseStatus === 'testing'}
                      className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {firebaseStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">Judul Laporan</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="cth: Kebocoran Pipa" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700">Deskripsi</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} placeholder="Jelaskan masalah secara detail" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"></textarea>
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-700">Lokasi</label>
                    <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required placeholder="cth: Di depan rumah No. 10" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                </div>
                <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-slate-700">Foto (Opsional)</label>
                    <input type="file" id="photo" onChange={e => setPhoto(e.target.files ? e.target.files[0] : null)} accept="image/*" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                </div>
                {success && <p className="text-sm text-green-600">Laporan berhasil dikirim!</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" isLoading={submitting} className="w-full">
                    Kirim Laporan
                </Button>
                </form>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card title="Riwayat Laporan Anda">
                {loadingReports ? (
                  <div className="flex justify-center p-4">
                    <Spinner size="sm" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Belum Ada Laporan</h3>
                    <p className="text-slate-500">Anda belum pernah membuat laporan masalah air.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map(report => (
                        <div key={report.id} className="p-4 border border-slate-200 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-slate-800">{report.title}</h4>
                                    <p className="text-sm text-slate-500">{new Date(report.reportedAt).toLocaleString('id-ID')}</p>
                                    {user?.email && (
                                        <p className="text-sm text-slate-500">Email: {user.email}</p>
                                    )}
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>{report.status}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">{report.description}</p>
                            {report.photoUrl && <img src={report.photoUrl} alt="Problem" className="mt-2 rounded-lg max-h-40"/>}
                        </div>
                    ))}
                  </div>
                )}
            </Card>
        </div>
    </div>
  );
};

export default ReportProblem;
