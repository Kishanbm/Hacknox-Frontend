import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  X,
  MessageSquare,
  AlertTriangle,
  Info,
  Check
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useAuth();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'My Teams', icon: <Users size={20} />, path: '/dashboard/teams' },
    { label: 'Hackathons', icon: <Calendar size={20} />, path: '/dashboard/hackathons' },
    { label: 'Submissions', icon: <Rocket size={20} />, path: '/dashboard/submissions' },
    { label: 'Profile', icon: <UserCircle size={20} />, path: '/dashboard/profile' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
  ];

  const notifications = [
      { id: 1, title: 'Team Invite: Alpha Squad', desc: 'Invited by Sarah Chen', time: '2m ago', type: 'invite', unread: true },
      { id: 2, title: 'Submission Deadline', desc: 'HackOnX submission closes in 2 hours.', time: '1h ago', type: 'alert', unread: true },
      { id: 3, title: 'System Update', desc: 'Platform maintenance scheduled for midnight.', time: '5h ago', type: 'info', unread: false },
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

      {/* Sidebar - Dark Black Theme */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-black m-0 lg:m-4 rounded-r-3xl lg:rounded-3xl shadow-2xl lg:shadow-sm 
        transform transition-transform duration-300 ease-in-out flex flex-col border-r lg:border border-gray-800
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static h-[100vh] lg:h-[calc(100vh-2rem)]
      `}>
        <div className="p-6 lg:p-8 pb-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex flex-col">
              <h1 className="text-3xl font-heading text-white tracking-tight leading-none group-hover:text-primary transition-colors duration-300">
                HACKON<span className="text-primary group-hover:text-white transition-colors duration-300">X</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                  <div className="h-0.5 w-4 bg-secondary rounded-full group-hover:w-8 transition-all duration-300"></div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Portal</span>
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
                        : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                    <div className={`${isActive ? 'text-secondary' : 'text-gray-500 group-hover:text-white transition-colors'}`}>
                        {item.icon}
                    </div>
                    <span>{item.label}</span>
                    {item.label === 'Hackathons' && (
                         <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'}`}>3</span>
                    )}
                </Link>
                );
            })}
            </nav>
        </div>

        {/* <div className="p-6 mt-auto"> */}
          {/* <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary opacity-20 rounded-full -mr-10 -mt-10 blur-xl"></div> */}
             {/* <div className="relative z-10"> */}
                {/* <div className="flex items-center gap-2 mb-2 text-secondary">
                   <Trophy size={16} />
                   <h4 className="font-heading text-sm">Level 5</h4>
                </div> */}
                {/* <div className="w-full bg-gray-700 h-1.5 rounded-full mb-2">
                    <div className="bg-secondary h-1.5 rounded-full" style={{width: '75%'}}></div>
                </div> */}
                {/* <p className="text-xs text-gray-400">1,250 XP to next level</p> */}
             {/* </div> */}
          {/* </div>
        </div> */}
         <div className="px-6 pt-4 pb-6">
           <button
             onClick={async () => {
               try {
                 await logout();
                 navigate('/');
               } catch (e) {
                 console.error('Logout failed', e);
               }
             }}
             className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
           >
             Logout
           </button>
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

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => navigate('/dashboard/notifications')}
                    className="relative w-10 h-10 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-primary shadow-sm border border-gray-100 transition-colors group"
                  >
                    <Bell size={20} className="group-hover:animate-swing" />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                </div>
                
                <div className="flex items-center gap-3 pl-0 md:pl-4 md:border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-gray-900">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}</div>
                      <div className="text-xs text-primary font-bold">{user?.email || ''}</div>
                    </div>
                    <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-tr from-primary to-purple-400 rounded-full flex items-center justify-center text-white font-heading border-2 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all text-sm md:text-base">
                      {user?.firstName ? `${(user.firstName[0]||'').toUpperCase()}${(user.lastName?.[0]||'').toUpperCase()}` : (user?.email?.slice(0,2).toUpperCase()||'ME')}
                    </div>
                </div>
            </div>
        </header>

        {children}
      </main>
    </div>
  );
};