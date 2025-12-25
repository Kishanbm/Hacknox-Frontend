import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileCheck, 
  UserCircle, 
  Bell, 
  Gavel,
  LogOut,
  Calendar,
  Menu,
  X,
  Settings
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

export const JudgeLayout: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/judge/dashboard' },
    { label: 'My Hackathons', icon: <Calendar size={20} />, path: '/judge/hackathons' },
    { label: 'Assignments', icon: <FileCheck size={20} />, path: '/judge/assignments' },
    { label: 'Profile', icon: <UserCircle size={20} />, path: '/judge/profile' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/judge/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-body text-gray-800">
      
      {/* Mobile/Tablet Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark Black Theme */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-black m-0 lg:m-4 rounded-r-3xl lg:rounded-3xl shadow-2xl lg:shadow-sm 
        transform transition-transform duration-300 ease-in-out flex flex-col border-r lg:border border-gray-800
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static h-[100vh] lg:h-[calc(100vh-2rem)]
      `}>
        <div className="p-6 lg:p-8 pb-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex flex-col">
              <h1 className="text-3xl font-heading text-white tracking-tight leading-none group-hover:text-[#5425FF] transition-colors duration-300">
                HACKON<span className="text-[#5425FF] group-hover:text-white transition-colors duration-300">X</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                  <div className="h-0.5 w-4 bg-[#5425FF] rounded-full group-hover:w-8 transition-all duration-300"></div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Judge Portal</span>
              </div>
            </div>
          </Link>
          <button 
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-4 lg:px-6 py-2 flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-gray-600"></div> 
              Evaluation Console
            </div>
            <nav className="space-y-2">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/judge/dashboard' && location.pathname.startsWith(item.path));
                return (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium border ${
                    isActive
                        ? 'bg-[#5425FF] text-white border-[#5425FF] shadow-lg shadow-[#5425FF]/30'
                        : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                    <div className={`${isActive ? 'text-[#24FF00]' : 'text-gray-500 group-hover:text-white transition-colors'}`}>
                        {item.icon}
                    </div>
                    <span>{item.label}</span>
                    {item.label === 'Assignments' && (
                         <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'}`}></span>
                    )}
                </Link>
                );
            })}
            </nav>
        </div>

        <div className="p-6 mt-auto">
             <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-[#5425FF] to-purple-400 border-2 border-gray-700 shadow-md flex items-center justify-center font-heading text-sm text-white">
                    {auth.user?.avatarUrl ? (
                      <img src={auth.user.avatarUrl} alt={`${auth.user.firstName || ''} ${auth.user.lastName || ''}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{((auth.user?.firstName?.[0] || '') + (auth.user?.lastName?.[0] || '')).toUpperCase() || 'JD'}</span>
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold truncate text-white">{auth.user ? `${auth.user.firstName || ''} ${auth.user.lastName || ''}`.trim() : 'Judge'}</div>
                    <div className="text-[10px] text-green-500 font-bold truncate flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Online
                    </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await auth.logout();
                    } catch (err) {
                      console.error('Logout failed', err);
                    } finally {
                      navigate('/');
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-lg transition-colors shadow-sm hover:shadow"
                >
                    <LogOut size={18} />
                </button>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen scroll-smooth w-full">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-6 lg:mb-8 bg-white/80 backdrop-blur-md lg:bg-transparent p-4 lg:p-0 rounded-2xl shadow-sm lg:shadow-none sticky top-0 z-30 lg:static border border-gray-100 lg:border-none">
            <div className="flex items-center gap-4">
                 {/* Mobile/Tablet Toggle */}
                 <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                 >
                    <Menu size={24} />
                 </button>

                 <div className="lg:hidden flex items-center gap-2">
                     <h1 className="font-heading text-xl text-gray-900">HACKON<span className="text-[#5425FF]">X</span></h1>
                </div>
            
                <div className="hidden lg:block">
                   <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">Evaluation Center</h2>
                   <p className="text-gray-500 text-sm mt-1">Review submissions, manage scores, and finalize results.</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                   <div className="w-2 h-2 bg-[#24FF00] rounded-full animate-pulse"></div>
                   <span className="text-xs font-bold text-gray-600">Secure Access</span>
                </div>

                <button 
                  onClick={() => navigate('/judge/notifications')}
                  className="relative w-10 h-10 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-[#5425FF] shadow-sm border border-gray-100 transition-colors group"
                >
                  <Bell size={20} className="group-hover:animate-swing" />
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>

        {children}
      </main>
    </div>
  );
};