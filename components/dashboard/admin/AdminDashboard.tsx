import React from 'react';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import ReportManagement from './ReportManagement';
import TariffManagement from './TariffManagement';
import PaymentManagement from './PaymentManagement';
import ReportsPage from './ReportsPage';

interface AdminDashboardProps {
  activeView: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeView }) => {
  console.log('AdminDashboard rendering with activeView:', activeView);
  
  try {
    switch (activeView) {
      case 'overview':
        console.log('Rendering AdminOverview');
        return <AdminOverview />;
      case 'users':
        console.log('Rendering UserManagement');
        return <UserManagement />;
      case 'payments':
        console.log('Rendering PaymentManagement');
        return <PaymentManagement />;
      case 'reports':
        console.log('Rendering ReportManagement');
        return <ReportManagement />;
      case 'tariffs':
        console.log('Rendering TariffManagement');
        return <TariffManagement />;
      case 'analysis':
        console.log('Rendering ReportsPage');
        return <ReportsPage />;
      default:
        console.log('Rendering default AdminOverview');
        return <AdminOverview />;
    }
  } catch (error) {
    console.error('Error rendering AdminDashboard:', error);
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Terjadi Kesalahan</h3>
        <p className="text-slate-600">Gagal memuat dashboard admin.</p>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-slate-500">Detail Error</summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </details>
      </div>
    );
  }
};

export default AdminDashboard;