import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Lock, Bell, LayoutDashboard, FileText, Calendar, 
  PieChart, Mail, Settings, Shield, Unlock, User,
  Ghost
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSecurity } from '../contexts/SecurityContext';
import { lockVault } from '../utils/db';

const STOIC_QUOTES = [
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "Silence is a lesson learned through the many sufferings of life.", author: "Seneca" },
  { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
  { text: "To be everywhere is to be nowhere.", author: "Seneca" },
  { text: "He who fears death will never do anything worth of a man who is alive.", author: "Seneca" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "No person has the power to have everything they want, but it is in their power not to want what they don't have.", author: "Seneca" },
  { text: "What we advise is that you should keep your thoughts to yourself.", author: "Epictetus" }
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerPanicLock } = useSecurity();
  const [quote, setQuote] = useState(STOIC_QUOTES[0]);

  useEffect(() => {
    // Pick a random quote on mount
    const randomQuote = STOIC_QUOTES[Math.floor(Math.random() * STOIC_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  const isAuth = location.pathname === '/auth';

  if (isAuth) return <Outlet />;

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Entries', path: '/entries', icon: <FileText size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    { name: 'Mood Analytics', path: '/mood-analytics', icon: <PieChart size={20} /> },
    { name: 'Future Letters', path: '/future-letters', icon: <Mail size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    { name: 'Security', path: '/security', icon: <Shield size={20} /> },
  ];

  const handleManualLock = () => {
    lockVault();
    navigate('/auth');
  };

  return (
    <div className="antialiased min-h-screen flex flex-col md:flex-row overflow-x-hidden selection:bg-[#a855f7]/30 selection:text-white bg-[#0b0a10]">
      
      {/* Mobile Top Nav */}
      <nav className="md:hidden flex justify-between items-center w-full px-6 h-16 bg-[#111018] border-b border-gray-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Ghost size={24} className="text-[#a855f7]" />
          <span className="font-bold text-lg text-white">GhostDiary</span>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <button onClick={handleManualLock}><Lock size={20} className="hover:text-white transition-colors" /></button>
          <Bell size={20} className="hover:text-white transition-colors" />
          <div className="w-8 h-8 rounded-full bg-[#7e22ce] flex items-center justify-center text-white">
            <User size={16} />
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#111018] border-r border-gray-800/50 py-6 z-40">
        
        {/* Logo */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7e22ce] flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Ghost size={18} className="text-white" />
          </div>
          <div className="font-bold text-xl tracking-tight text-white">
            Ghost<span className="text-[#a855f7]">Diary</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-4">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name}
                to={link.path} 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 
                  ${isActive 
                    ? 'bg-[#1a1528] text-white shadow-[inset_2px_0_0_#a855f7]' 
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1924]'
                  }`}
              >
                <span className={`${isActive ? 'text-[#a855f7]' : 'text-gray-400'} transition-colors`}>
                  {link.icon}
                </span>
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            )
          })}

          {/* Panic Lock Button */}
          <button 
            onClick={triggerPanicLock}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-gray-400 hover:text-white hover:bg-[#1a1924] mt-2 group"
          >
            <Unlock size={20} className="group-hover:text-red-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-red-400 transition-colors">Panic Lock</span>
          </button>
        </nav>
        
        {/* Bottom Status Panel */}
        <div className="px-6 mt-auto pt-6">
          <div className="bg-[#0b0a10] rounded-xl p-4 border border-gray-800/50">
            <div className="flex items-center gap-3 mb-1">
              <Lock size={16} className="text-gray-400" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">Vault Status</span>
                <span className="text-sm text-emerald-400 font-bold">Secure</span>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 mt-3 font-medium tracking-wide">
              100% Offline
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 relative">
        
        {/* Stoic Whisper - Only on Dashboard */}
        {location.pathname === '/' && (
          <div className="hidden lg:flex absolute top-8 right-10 z-30 max-w-[280px] pointer-events-none animate-fade-in-slow">
            <p className="text-gray-500 italic text-sm text-right leading-relaxed font-serif">
              "{quote.text}"
              <br/>
              <span className="text-xs text-gray-600 not-italic uppercase tracking-widest mt-1 block">— {quote.author}</span>
            </p>
          </div>
        )}

        <Outlet />
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-[#111018] border-t border-gray-800 pb-safe">
        {navLinks.slice(0, 4).map(link => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.name}
              to={link.path} 
              className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-[#a855f7]' : 'text-gray-500'}`}
            >
              {link.icon}
            </Link>
          )
        })}
      </nav>

    </div>
  );
}
