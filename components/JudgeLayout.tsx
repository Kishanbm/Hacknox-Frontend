import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileCheck, 
  UserCircle, 
  Bell, 
  Gavel,
  LogOut,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

export const JudgeLayout: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/judge/dashboard' },
    { label: 'My Hackathons', icon: <Calendar size={20} />, path: '/judge/hackathons' },
    { label: 'Assignments', icon: <FileCheck size={20} />, path: '/judge/assignments' },
    { label: 'Profile', icon: <UserCircle size={20} />, path: '/judge/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-body text-gray-800">
      {/* Sidebar - Dark Theme with Project Colors */}
      <aside className="w-72 bg-[#0F172A] m-4 rounded-3xl shadow-xl flex flex-col sticky top-4 h-[calc(100vh-2rem)] text-white overflow-hidden border border-[#1E293B]">
        <div className="p-8 pb-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#5425FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#5425FF]/20 group-hover:scale-105 transition-transform">
                <Gavel size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-heading tracking-tight leading-none text-white">
                HACKON<span className="text-[#5425FF]">X</span>
              </h1>
              <span className="text-[10px] font-bold text-[#24FF00] tracking-widest uppercase">Verified Judge</span>
            </div>
          </Link>
        </div>

        <div className="px-4 py-2 flex-1">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-gray-500"></div> 
              Evaluation Console
            </div>
            <nav className="space-y-1">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/judge/dashboard' && location.pathname.startsWith(item.path));
                return (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group font-medium ${
                    isActive
                        ? 'bg-[#5425FF] text-white shadow-lg shadow-[#5425FF]/30'
                        : 'text-gray-400 hover:bg-[#1E293B] hover:text-white'
                    }`}
                >
                    <div className={`${isActive ? 'text-[#24FF00]' : 'text-gray-500 group-hover:text-white transition-colors'}`}>
                        {item.icon}
                    </div>
                    <span>{item.label}</span>
                    {item.label === 'Assignments' && (
                         <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-[#1E293B] text-gray-400'}`}>12</span>
                    )}
                </Link>
                );
            })}
            </nav>
        </div>

        <div className="p-4 bg-[#1E293B] mt-auto border-t border-gray-800">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5425FF] to-purple-400 border-2 border-gray-700 flex items-center justify-center font-heading text-sm text-white">
                    JD
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold truncate text-white">Judge Davis</div>
                    <div className="text-xs text-[#24FF00] truncate flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#24FF00] animate-pulse"></div> Online
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
                    <Gavel size={16} className="text-white"/>
                 </div>
                 <h1 className="font-heading text-xl text-gray-900">HACKON<span className="text-[#5425FF]">X</span></h1>
            </div>
            
            <div className="hidden md:block">
               <h2 className="text-3xl font-bold text-gray-900 font-heading">Evaluation Center</h2>
               <p className="text-gray-500 text-sm mt-1">Review submissions, manage scores, and finalize results.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                   <div className="w-2 h-2 bg-[#24FF00] rounded-full animate-pulse"></div>
                   <span className="text-xs font-bold text-gray-600">Secure Access</span>
                </div>

                <button className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-[#5425FF] shadow-sm border border-gray-100 transition-colors group">
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