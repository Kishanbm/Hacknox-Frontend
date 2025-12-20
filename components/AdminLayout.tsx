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
  X,
  Bell
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Premium Light Theme */}
      {/* Fixed: Removed 'relative' from base classes to prevent it from overriding 'fixed' on mobile. Added 'lg:relative' for desktop positioning context. */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white m-0 lg:m-4 rounded-r-3xl lg:rounded-[2rem] shadow-2xl lg:shadow-gray-200/50 
        transform transition-transform duration-300 ease-in-out flex flex-col border-r lg:border border-white overflow-hidden 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative h-[100vh] lg:h-[calc(100vh-2rem)]
      `}>
        
        {/* Background Gradient Blur for premium feel */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#5425FF]/5 to-transparent pointer-events-none"></div>

        <div className="p-6 lg:p-8 pb-4 lg:pb-6 relative z-10 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex flex-col">
              <h1 className="text-3xl font-heading text-gray-900 tracking-tight leading-none group-hover:text-[#5425FF] transition-colors duration-300">
                HACKON<span className="text-[#5425FF] group-hover:text-gray-900 transition-colors duration-300">X</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                  <div className="h-0.5 w-4 bg-[#24FF00] rounded-full group-hover:w-8 transition-all duration-300"></div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Admin Console</span>
              </div>
            </div>
          </Link>
          <button 
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
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
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen scroll-smooth w-full relative">
        {/* Top Header - Matches other layouts */}
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
                   <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">Control Center</h2>
                   <p className="text-gray-500 text-sm mt-1">System overview and governance controls.</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                   <div className="w-2 h-2 bg-[#24FF00] rounded-full animate-pulse"></div>
                   <span className="text-xs font-bold text-gray-600">System Secure</span>
                </div>

                <button className="relative w-10 h-10 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-[#5425FF] shadow-sm border border-gray-100 transition-colors group">
                    <Bell size={20} className="group-hover:animate-swing" />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                {/* Admin Avatar */}
                <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-[#111827] to-gray-700 rounded-full flex items-center justify-center text-white font-heading text-sm border-2 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-[#5425FF] transition-all">
                    AD
                </div>
            </div>
        </header>

        {children}
      </main>
    </div>
  );
};