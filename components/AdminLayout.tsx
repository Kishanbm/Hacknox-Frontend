import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Gavel, 
  Shield,
  LogOut,
  Calendar,
  FileText,
  GitMerge,
  FileClock,
  Megaphone,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Control Center', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { label: 'Hackathons', icon: <Calendar size={20} />, path: '/admin/hackathons' },
    { label: 'Participants', icon: <Users size={20} />, path: '/admin/participants' },
    { label: 'Judge Manager', icon: <Gavel size={20} />, path: '/admin/judges' },
    { label: 'Assignments', icon: <GitMerge size={20} />, path: '/admin/assignments' },
    { label: 'Submissions', icon: <FileText size={20} />, path: '/admin/submissions' },
    { label: 'Announcements', icon: <Megaphone size={20} />, path: '/admin/announcements' },
    { label: 'System Logs', icon: <FileClock size={20} />, path: '/admin/audit' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-body text-gray-800">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Premium Light Theme */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white m-0 md:m-4 rounded-r-3xl md:rounded-[2rem] shadow-2xl md:shadow-gray-200/50 
        transform transition-transform duration-300 ease-in-out flex flex-col border-r md:border border-white overflow-hidden relative
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static h-[100vh] md:h-[calc(100vh-2rem)]
      `}>
        
        {/* Background Gradient Blur for premium feel */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#5425FF]/5 to-transparent pointer-events-none"></div>

        <div className="p-6 md:p-8 pb-4 md:pb-6 relative z-10 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#5425FF] to-[#3a1bf2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#5425FF]/30 group-hover:scale-105 transition-transform duration-300">
                <Shield size={22} className="text-[#24FF00] fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-heading tracking-tight leading-none text-gray-900 group-hover:text-[#5425FF] transition-colors">
                HACKON<span className="text-[#5425FF]">X</span>
              </h1>
              <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase flex items-center gap-1 mt-1">
                 Admin Console
              </span>
            </div>
          </Link>
          <button 
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-4 py-2 flex-1 overflow-y-auto custom-scrollbar relative z-10">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4 flex items-center gap-2 opacity-80">
              <div className="w-1.5 h-1.5 rounded-full bg-[#24FF00] shadow-[0_0_6px_#24FF00]"></div> 
              Governance
            </div>
            <nav className="space-y-1.5">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                return (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group font-medium relative overflow-hidden ${
                    isActive
                        ? 'bg-gradient-to-r from-[#5425FF] to-[#3a1bf2] text-white'
                        : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-[#5425FF] hover:pl-5'
                    }`}
                >
                    <div className={`transition-all duration-300 relative z-10 ${isActive ? 'text-[#24FF00] drop-shadow-[0_0_8px_rgba(36,255,0,0.6)] scale-110' : 'text-gray-400 group-hover:text-[#5425FF]'}`}>
                        {item.icon}
                    </div>
                    <span className={`relative z-10 tracking-wide ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                    
                    {/* Active State Accents */}
                    {isActive && (
                        <>
                            {/* Subtle shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer"></div>
                        </>
                    )}
                </Link>
                );
            })}
            </nav>
        </div>

        <div className="p-4 mt-auto relative z-10">
             <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center gap-3 shadow-sm group hover:border-[#5425FF]/20 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 border-2 border-white shadow-md flex items-center justify-center font-heading text-sm text-white relative">
                    AD
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#24FF00] border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold truncate text-gray-900 group-hover:text-[#5425FF] transition-colors">Admin Director</div>
                    <div className="text-[10px] text-gray-500 truncate flex items-center gap-1 font-bold">
                        Super User
                    </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow">
                    <LogOut size={18} />
                </button>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen scroll-smooth w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
                <Menu size={24} />
            </button>
            <h1 className="font-heading text-lg text-gray-900">Admin Console</h1>
            <div className="w-8"></div> {/* Spacer to center title */}
        </div>

        {children}
      </main>
    </div>
  );
};