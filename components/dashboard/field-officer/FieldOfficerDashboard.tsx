import React from 'react';
import FieldOfficerOverview from './FieldOfficerOverview';
import ReportAssignments from './ReportAssignments';
import BillingManagement from '../admin/BillingManagement';

interface FieldOfficerDashboardProps {
  activeView: string;
}

const FieldOfficerDashboard: React.FC<FieldOfficerDashboardProps> = ({ activeView }) => {
  console.log('FieldOfficerDashboard rendering with activeView:', activeView);
  
  try {
    switch (activeView) {
      case 'overview':
        console.log('Rendering FieldOfficerOverview');
        return <FieldOfficerOverview />;
      case 'assignments':
        console.log('Rendering ReportAssignments');
        return <ReportAssignments />;
      case 'billing':
        console.log('Rendering BillingManagement');
        return <BillingManagement />;
      default:
        console.log('Rendering default FieldOfficerOverview');
        return <FieldOfficerOverview />;
    }
  } catch (error) {
    console.error('Error rendering FieldOfficerDashboard:', error);
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Terjadi Kesalahan</h3>
        <p className="text-slate-600">Gagal memuat dashboard petugas lapangan.</p>
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

export default FieldOfficerDashboard;