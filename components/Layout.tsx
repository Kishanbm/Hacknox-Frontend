import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Rocket, 
  UserCircle, 
  Bell, 
  Settings, 
  Trophy,
  Calendar,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'My Teams', icon: <Users size={20} />, path: '/dashboard/teams' },
    { label: 'Hackathons', icon: <Calendar size={20} />, path: '/dashboard/hackathons' },
    { label: 'Submissions', icon: <Rocket size={20} />, path: '/dashboard/submissions' },
    { label: 'Profile', icon: <UserCircle size={20} />, path: '/dashboard/profile' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-background font-body text-gray-800">
      
      {/* Mobile/Tablet Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-surface m-0 lg:m-4 rounded-r-3xl lg:rounded-3xl shadow-2xl lg:shadow-sm 
        transform transition-transform duration-300 ease-in-out flex flex-col border-r lg:border border-gray-100
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static h-[100vh] lg:h-[calc(100vh-2rem)]
      `}>
        <div className="p-6 lg:p-8 pb-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-heading text-gray-900 tracking-tight leading-none">
                HACKON<span className="text-primary">X</span>
              </h1>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Participant</span>
            </div>
          </Link>
          <button 
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-4 lg:px-6 py-2 flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-gray-300"></div> 
              Main Menu
            </div>
            <nav className="space-y-2">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium border ${
                    isActive
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                        : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50 hover:text-primary'
                    }`}
                >
                    <div className={`${isActive ? 'text-secondary' : 'text-gray-400 group-hover:text-primary transition-colors'}`}>
                        {item.icon}
                    </div>
                    <span>{item.label}</span>
                    {item.label === 'Hackathons' && (
                         <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>3</span>
                    )}
                </Link>
                );
            })}
            </nav>
        </div>

        <div className="p-6 mt-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary opacity-20 rounded-full -mr-10 -mt-10 blur-xl"></div>
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-secondary">
                   <Trophy size={16} />
                   <h4 className="font-heading text-sm">Level 5</h4>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full mb-2">
                    <div className="bg-secondary h-1.5 rounded-full" style={{width: '75%'}}></div>
                </div>
                <p className="text-xs text-gray-400">1,250 XP to next level</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen scroll-smooth w-full">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-6 lg:mb-8 bg-surface/80 backdrop-blur-md lg:bg-transparent p-4 lg:p-0 rounded-2xl shadow-sm lg:shadow-none sticky top-0 z-30 lg:static border border-gray-100 lg:border-none">
            <div className="flex items-center gap-4">
                 {/* Mobile/Tablet Toggle */}
                 <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                 >
                    <Menu size={24} />
                 </button>

                 <div className="lg:hidden flex items-center gap-2">
                     <h1 className="font-heading text-xl text-gray-900">HACKON<span className="text-primary">X</span></h1>
                </div>
            
                <div className="hidden lg:block">
                   <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">Dashboard</h2>
                   <p className="text-gray-500 text-sm mt-1 hidden xl:block">Manage your teams, submissions, and hackathon invites.</p>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-xs font-bold text-gray-600">System Online</span>
                </div>

                <button className="relative w-10 h-10 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-primary shadow-sm border border-gray-100 transition-colors group">
                    <Bell size={20} className="group-hover:animate-swing" />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-0 md:pl-4 md:border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-gray-900">Alex Morgan</div>
                        <div className="text-xs text-primary font-bold">@alexcodes</div>
                    </div>
                    <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-tr from-primary to-purple-400 rounded-full flex items-center justify-center text-white font-heading border-2 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all text-sm md:text-base">
                        AM
                    </div>
                </div>
            </div>
        </header>

        {children}
      </main>
    </div>
  );
};