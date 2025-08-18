import React, { useState, useContext, Fragment, useEffect } from 'react';
import { AuthContext } from '../App';
import { User, UserRole } from '../types';
import {
  HomeIcon, BillIcon, ChartIcon, ExclamationTriangleIcon, UserCircleIcon,
  UsersIcon, LogoutIcon, TachometerIcon, CogIcon, MoneyIcon, XCircleIcon,
  CreditCardIcon, DocumentChartBarIcon, WrenchScrewdriverIcon, ClipboardDocumentListIcon
} from '../components/icons';
import UserDashboard from '../components/dashboard/user/UserDashboard';
import AdminDashboard from '../components/dashboard/admin/AdminDashboard';
import FieldOfficerDashboard from '../components/dashboard/field-officer/FieldOfficerDashboard';
import { Transition, Dialog } from '@headlessui/react';

const SidebarNavigation = ({ user, activeView, setActiveView }: { 
  user: User; 
  activeView: string; 
  setActiveView: (view: string) => void; 
}) => {
  console.log('SidebarNavigation render: user role =', user.role, 'activeView =', activeView);
  
  const userNav = [
    { name: 'Ringkasan', icon: HomeIcon, view: 'overview' },
    { name: 'Tagihan', icon: BillIcon, view: 'bills' },
    { name: 'Grafik Konsumsi', icon: ChartIcon, view: 'usage' },
    { name: 'Lapor Masalah', icon: ExclamationTriangleIcon, view: 'report' },
    { name: 'Profil Saya', icon: UserCircleIcon, view: 'profile' },
  ];

  const adminNav = [
    { name: 'Ringkasan', icon: HomeIcon, view: 'overview' },
    { name: 'Manajemen Pengguna', icon: UsersIcon, view: 'users' },
    { name: 'Manajemen Pembayaran', icon: CreditCardIcon, view: 'payments' },
    { name: 'Laporan Masalah', icon: ExclamationTriangleIcon, view: 'reports' },
    { name: 'Manajemen Tarif', icon: MoneyIcon, view: 'tariffs' },
    { name: 'Laporan & Analisis', icon: DocumentChartBarIcon, view: 'analysis' },
  ];

  const fieldOfficerNav = [
    { name: 'Ringkasan', icon: HomeIcon, view: 'overview' },
    { name: 'Tugas Laporan', icon: ClipboardDocumentListIcon, view: 'assignments' },
    { name: 'Input Meteran', icon: TachometerIcon, view: 'billing' },
  ];

  let navigation;
  switch (user.role) {
      case UserRole.ADMIN:
          navigation = adminNav;
          console.log('Using admin navigation with', adminNav.length, 'items');
          break;
      case UserRole.FIELD_OFFICER:
          navigation = fieldOfficerNav;
          console.log('Using field officer navigation with', fieldOfficerNav.length, 'items');
          break;
      case UserRole.USER:
      default:
          navigation = userNav;
          console.log('Using user navigation with', userNav.length, 'items');
  }

  return (
    <>
      {navigation.map((item) => (
        <a
          key={item.name}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            console.log('Navigation clicked:', item.view);
            setActiveView(item.view);
          }}
          className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg ${
            activeView === item.view
              ? 'bg-primary-700 text-white'
              : 'text-primary-100 hover:bg-primary-600 hover:text-white'
          }`}
        >
          <item.icon className="mr-4 flex-shrink-0 h-6 w-6" />
          {item.name}
        </a>
      ))}
    </>
  );
};

const DashboardPage: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  console.log('DashboardPage render: user =', user, 'activeView =', activeView);

  // Set default view based on user role when component mounts
  useEffect(() => {
    if (user) {
      console.log('DashboardPage useEffect: user role is', user.role);
      // Set appropriate default view for each role
      switch (user.role) {
        case UserRole.ADMIN:
          console.log('Setting activeView to overview for ADMIN');
          setActiveView('overview');
          break;
        case UserRole.FIELD_OFFICER:
          console.log('Setting activeView to overview for FIELD_OFFICER');
          setActiveView('overview');
          break;
        case UserRole.USER:
        default:
          console.log('Setting activeView to overview for USER');
          setActiveView('overview');
          break;
      }
    } else {
      console.log('DashboardPage useEffect: no user found');
    }
  }, [user]);

  if (!user) {
    console.log('DashboardPage: no user, showing access denied');
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Akses Ditolak</h2>
          <p className="text-slate-600">Silakan login terlebih dahulu</p>
        </div>
      </div>
    );
  }
  
  const renderContent = () => {
    console.log('renderContent called with user role:', user.role, 'and activeView:', activeView);
    
    try {
      switch(user.role) {
          case UserRole.ADMIN:
              console.log('Rendering AdminDashboard');
              return <AdminDashboard activeView={activeView} />;
          case UserRole.FIELD_OFFICER:
              console.log('Rendering FieldOfficerDashboard');
              return <FieldOfficerDashboard activeView={activeView} />;
          case UserRole.USER:
          default:
              console.log('Rendering UserDashboard');
              return <UserDashboard activeView={activeView} setActiveView={setActiveView} />;
      }
    } catch (error) {
      console.error('Error rendering dashboard content:', error);
      return (
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Terjadi Kesalahan</h3>
          <p className="text-slate-600">Gagal memuat dashboard. Silakan refresh halaman.</p>
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

  const getTitle = () => {
    console.log('getTitle called with user role:', user.role, 'activeView:', activeView);
    
    const navs = {
        [UserRole.ADMIN]: [
            { name: 'Ringkasan', view: 'overview' }, { name: 'Manajemen Pengguna', view: 'users' }, 
            { name: 'Manajemen Pembayaran', view: 'payments' },
            { name: 'Laporan Masalah', view: 'reports' }, { name: 'Manajemen Tarif', view: 'tariffs' },
            { name: 'Laporan & Analisis', view: 'analysis'}
        ],
        [UserRole.USER]: [
            { name: 'Ringkasan', view: 'overview' }, { name: 'Riwayat Tagihan', view: 'bills' }, 
            { name: 'Grafik Konsumsi Air', view: 'usage' }, { name: 'Lapor Masalah', view: 'report' }, 
            { name: 'Profil Pengguna', view: 'profile' }
        ],
        [UserRole.FIELD_OFFICER]: [
            { name: 'Ringkasan Tugas', view: 'overview' },
            { name: 'Daftar Tugas Laporan', view: 'assignments' },
            { name: 'Input Meteran Pelanggan', view: 'billing' },
        ],
    };

    const navigation = navs[user.role] || navs[UserRole.USER];
    const title = navigation.find(item => item.view === activeView)?.name || 'Dashboard';
    console.log('getTitle result:', title);
    return title;
  }

  const getRoleText = (role: UserRole) => {
    console.log('getRoleText called with role:', role);
    
    const roleText = (() => {
      switch (role) {
          case UserRole.ADMIN: return 'Admin';
          case UserRole.FIELD_OFFICER: return 'Petugas Lapangan';
          case UserRole.USER:
          default: return 'Pengguna';
      }
    })();
    
    console.log('getRoleText result:', roleText);
    return roleText;
  }

  const SidebarContent = () => {
    console.log('SidebarContent render: user =', user?.name, 'role =', user?.role);
    
    return (
      <div className="flex flex-col flex-grow bg-primary-800 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-2xl font-bold text-white">PAM Desa Digital</h1>
        </div>
        <div className="mt-8 flex-1 flex flex-col">
          <div className="px-2 space-y-2">
             <SidebarNavigation user={user} activeView={activeView} setActiveView={setActiveView}/>
          </div>
        </div>
         <div className="flex-shrink-0 flex border-t border-primary-700 p-4">
            <button type="button" onClick={() => {
              console.log('Logout button clicked');
              logout();
            }} className="flex-shrink-0 w-full group block text-left focus:outline-none">
              <div className="flex items-center">
                  <LogoutIcon className="h-6 w-6 text-primary-200 group-hover:text-white"/>
                <div className="ml-3">
                  <p className="text-base font-medium text-primary-100 group-hover:text-white">Keluar</p>
                </div>
              </div>
            </button>
          </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100">
      {/* Mobile Sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={() => {
          console.log('Mobile sidebar dialog onClose');
          setSidebarOpen(false);
        }}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => {
                    console.log('Mobile sidebar close clicked');
                    setSidebarOpen(false);
                  }}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <SidebarContent />
            </Dialog.Panel>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent />
        </div>
      </div>
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => {
              console.log('Mobile sidebar toggle clicked');
              setSidebarOpen(true);
            }}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
             <h2 className="text-xl font-semibold text-slate-800">{(() => {
               console.log('Getting title for role:', user.role, 'activeView:', activeView);
               return getTitle();
             })()}</h2>
             <div className="ml-4 flex items-center md:ml-6">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <span className="text-right mr-3">
                      <p className="text-sm font-medium text-slate-700">{user.name}</p>
                      <p className="text-xs text-slate-500">{(() => {
                        console.log('Getting role text for role:', user.role);
                        return getRoleText(user.role);
                      })()}</p>
                      {user.email && (
                        <p className="text-xs text-slate-400">{user.email}</p>
                      )}
                    </span>
                    <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="User avatar" />
                  </div>
                </div>
              </div>
          </div>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {(() => {
                console.log('About to render content for role:', user.role, 'activeView:', activeView);
                return renderContent();
              })()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;