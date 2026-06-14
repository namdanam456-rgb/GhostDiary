import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Ghost, Shield, CloudOff, Eye, EyeOff, Moon } from 'lucide-react';
import { unlockVault, isUnlocked, isVaultConfigured, setupVault } from '../utils/db';

export default function Auth() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isUnlocked()) {
      navigate('/');
      return;
    }
    
    isVaultConfigured().then(configured => {
      setIsSetupMode(!configured);
    });
  }, [navigate]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSetupMode) {
        const success = await setupVault(password);
        if (success) {
          navigate('/');
        } else {
          setError('Failed to setup vault. Please try again.');
        }
      } else {
        const success = await unlockVault(password);
        if (success) {
          navigate('/');
        } else {
          setError('Invalid master password. The vault remains sealed.');
        }
      }
    } catch (err) {
      setError('An error occurred during decryption.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0a10] text-white flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Mountain & Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* User uploaded background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity" 
          style={{ backgroundImage: "url('/front.png')" }}
        />
        
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#1c0d38] to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-[#0b0a10] to-transparent z-10"></div>
        {/* Subtle SVG Mountains placeholder */}
        <div className="absolute bottom-0 left-0 w-full opacity-30 flex items-end">
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
            <path fill="#150f24" fillOpacity="1" d="M0,224L48,208C96,192,192,160,288,154.7C384,149,480,171,576,192C672,213,768,235,864,224C960,213,1056,171,1152,144C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        {/* Moon and Stars */}
        <Moon className="absolute top-12 right-12 md:top-24 md:right-32 text-purple-200/40" size={64} fill="currentColor" />
        <div className="absolute top-20 left-1/4 w-1 h-1 bg-white rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse delay-700"></div>
      </div>

      <main className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8 animate-float">
          <div className="w-20 h-20 bg-gradient-to-br from-[#a855f7] to-[#7e22ce] rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <Ghost size={40} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Ghost<span className="text-[#a855f7]">Diary</span></h1>
          <p className="text-gray-400 text-center font-medium">Write freely. Reveal only<br/>when you choose.</p>
        </div>

        {/* Feature List */}
        <div className="w-full flex flex-col gap-3 mb-10 pl-6">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Shield size={18} className="text-[#a855f7]" /> 100% Offline
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Lock size={18} className="text-[#a855f7]" /> End-to-End Encrypted
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <CloudOff size={18} className="text-[#a855f7]" /> Zero Cloud Storage
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder={isSetupMode ? "Create Master Password" : "Enter Master Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1924] border border-gray-700 focus:border-[#a855f7] rounded-xl px-4 py-4 text-white placeholder-gray-500 outline-none transition-all shadow-inner pr-12"
              required
              autoFocus
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-900/50">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !password || password.length < 4}
            className="w-full bg-gradient-to-r from-[#7e22ce] to-[#6b21a8] hover:from-[#9333ea] hover:to-[#7e22ce] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(126,34,206,0.3)] hover:shadow-[0_4px_25px_rgba(126,34,206,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            <Lock size={18} />
            {loading ? (isSetupMode ? 'Creating Vault...' : 'Decrypting Vault...') : (isSetupMode ? 'Create Vault' : 'Unlock Vault')}
          </button>
        </form>

        <p className="text-gray-500 text-xs mt-6 text-center">
          AES-256 Encrypted • Your data, only yours.
        </p>

      </main>
    </div>
  );
}
