import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Gavel, 
  Shield,
  LogOut,
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Control Center', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { label: 'Hackathons', icon: <Calendar size={20} />, path: '/admin/hackathons' },
    { label: 'Participants', icon: <Users size={20} />, path: '/admin/participants' },
    { label: 'Judge Manager', icon: <Gavel size={20} />, path: '/admin/judges' },
    { label: 'Submissions', icon: <FileText size={20} />, path: '/admin/submissions' },
    { label: 'Risk & Audit', icon: <AlertTriangle size={20} />, path: '/admin/audit' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-body text-gray-800">
      {/* Sidebar - Dark Theme for Admin Authority */}
      <aside className="w-72 bg-[#111827] m-4 rounded-3xl shadow-xl flex flex-col sticky top-4 h-[calc(100vh-2rem)] text-white overflow-hidden border border-gray-800">
        <div className="p-8 pb-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#5425FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#5425FF]/20 group-hover:scale-105 transition-transform">
                <Shield size={20} className="text-white fill-current" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-heading tracking-tight leading-none text-white">
                HACKON<span className="text-[#5425FF]">X</span>
              </h1>
              <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase flex items-center gap-1">
                 Admin Console
              </span>
            </div>
          </Link>
        </div>

        <div className="px-4 py-2 flex-1">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-red-500"></div> 
              Governance
            </div>
            <nav className="space-y-1">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                return (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group font-medium ${
                    isActive
                        ? 'bg-[#5425FF] text-white shadow-lg shadow-[#5425FF]/30'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                    <div className={`${isActive ? 'text-red-400' : 'text-gray-500 group-hover:text-white transition-colors'}`}>
                        {item.icon}
                    </div>
                    <span>{item.label}</span>
                </Link>
                );
            })}
            </nav>
        </div>

        <div className="p-4 bg-gray-900 mt-auto border-t border-gray-800">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-orange-600 border-2 border-gray-700 flex items-center justify-center font-heading text-sm text-white">
                    AD
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold truncate text-white">Admin Director</div>
                    <div className="text-xs text-red-500 truncate flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Super User
                    </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                    <LogOut size={18} />
                </button>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen scroll-smooth">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 md:bg-transparent md:shadow-none md:border-none md:p-0">
            <div className="md:hidden flex items-center gap-2">
                 <div className="w-8 h-8 bg-[#5425FF] rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-white"/>
                 </div>
                 <h1 className="font-heading text-xl text-gray-900">HACKON<span className="text-[#5425FF]">X</span></h1>
            </div>
            
            <div className="hidden md:block">
               <h2 className="text-3xl font-bold text-gray-900 font-heading">Operations Center</h2>
               <p className="text-gray-500 text-sm mt-1">Monitor health, manage risks, and govern hackathon lifecycles.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full border border-red-100 shadow-sm">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                   <span className="text-xs font-bold text-red-700">Admin Mode</span>
                </div>
            </div>
        </header>

        {children}
      </main>
    </div>
  );
};