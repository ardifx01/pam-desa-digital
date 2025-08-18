
import React from 'react';
import UserOverview from './UserOverview';
import BillHistory from './BillHistory';
import UsageGraph from './UsageGraph';
import ReportProblem from './ReportProblem';
import UserProfile from './UserProfile';

interface UserDashboardProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ activeView, setActiveView }) => {
  console.log('UserDashboard rendering with activeView:', activeView);
  
  try {
    switch (activeView) {
      case 'overview':
        console.log('Rendering UserOverview');
        return <UserOverview setActiveView={setActiveView} />;
      case 'bills':
        console.log('Rendering BillHistory');
        return <BillHistory />;
      case 'usage':
        console.log('Rendering UsageGraph');
        return <UsageGraph />;
      case 'report':
        console.log('Rendering ReportProblem');
        return <ReportProblem />;
      case 'profile':
        console.log('Rendering UserProfile');
        return <UserProfile />;
      default:
        console.log('Rendering default UserOverview');
        return <UserOverview setActiveView={setActiveView} />;
    }
  } catch (error) {
    console.error('Error rendering UserDashboard:', error);
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Terjadi Kesalahan</h3>
        <p className="text-slate-600">Gagal memuat dashboard pengguna.</p>
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

export default UserDashboard;
