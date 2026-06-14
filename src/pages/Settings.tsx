import { useState } from 'react';
import { Upload, Download, CheckCircle, ArrowLeft, Moon, Shield, Keyboard, Cloud, Palette, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportVaultToFile, importVaultFromFile } from '../utils/db';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Mock settings state for UI
  const [autoLock, setAutoLock] = useState(() => localStorage.getItem('ghostdiary_autolock') !== 'false');
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const navigate = useNavigate();

  const handleExport = async () => {
    setLoading(true);
    await exportVaultToFile();
    setLoading(false);
    showSuccess('Vault exported successfully!');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    const success = await importVaultFromFile(file);
    setLoading(false);
    
    if (success) {
      showSuccess('Vault imported successfully!');
      setTimeout(() => window.location.reload(), 2000);
    } else {
      alert('Invalid backup file. Encryption signature mismatch.');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto w-full flex flex-col gap-8 relative pt-24 md:pt-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors p-2 md:hidden">
          <ArrowLeft size={20} />
        </button>
        <header>
          <h1 className="text-3xl font-bold text-white mb-2">Settings & Backup</h1>
          <p className="text-gray-400">Manage your vault and application preferences.</p>
        </header>
      </div>

      {successMsg && (
        <div className="bg-[#2a1d45] border border-[#a855f7]/50 text-[#d8b4fe] px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} className="text-[#a855f7]" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Backup & Restore */}
        <section className="bg-[#111018] rounded-2xl p-6 md:p-8 border border-gray-800/50 flex flex-col gap-6 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Shield size={20} className="text-[#a855f7]" /> Vault Backup
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your diary is completely offline. If you clear your browser data or change devices, you will lose everything unless you export a backup.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-auto">
            <button 
              onClick={handleExport}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#1a1924] hover:bg-[#2a283e] border border-gray-700/50 text-white transition-colors flex items-center justify-center gap-3 font-bold group"
            >
              <Download size={20} className="text-[#a855f7] group-hover:text-[#d8b4fe]" />
              <span>Export Encrypted Backup</span>
            </button>

            <label className="w-full py-4 rounded-xl bg-[#1a1924] hover:bg-[#2a283e] border border-gray-700/50 text-white transition-colors flex items-center justify-center gap-3 font-bold group cursor-pointer">
              <Upload size={20} className="text-emerald-400 group-hover:text-emerald-300" />
              <span>Import Backup</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </section>

        {/* General Preferences */}
        <section className="bg-[#111018] rounded-2xl p-6 md:p-8 border border-gray-800/50 flex flex-col gap-6 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Moon size={20} className="text-[#a855f7]" /> Preferences
            </h2>
            
            <div className="flex flex-col gap-4">
              
              <div className="flex items-center justify-between p-4 bg-[#1a1924] rounded-xl border border-gray-800">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-gray-400" />
                  <div>
                    <div className="font-bold text-white text-sm">Auto-Lock Vault</div>
                    <div className="text-xs text-gray-500">Lock after 5 minutes of inactivity</div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const newValue = !autoLock;
                    setAutoLock(newValue);
                    localStorage.setItem('ghostdiary_autolock', String(newValue));
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative ${autoLock ? 'bg-[#a855f7]' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${autoLock ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1924] rounded-xl border border-gray-800">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-gray-400" />
                  <div>
                    <div className="font-bold text-white text-sm">UI Sounds</div>
                    <div className="text-xs text-gray-500">Play sounds on unlock & save</div>
                  </div>
                </div>
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-[#a855f7]' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${soundEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1924] rounded-xl border border-gray-800 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Keyboard size={18} className="text-gray-400" />
                  <div>
                    <div className="font-bold text-white text-sm">Panic Keybind</div>
                    <div className="text-xs text-gray-500">Currently fixed to ESC x 3</div>
                  </div>
                </div>
                <div className="text-xs font-bold bg-[#0b0a10] px-2 py-1 rounded text-gray-500">ESC</div>
              </div>

            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="bg-[#111018] rounded-2xl p-6 md:p-8 border border-gray-800/50 flex flex-col gap-6 shadow-xl lg:col-span-2 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#a855f7]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-white">Coming Soon</h2>
            <div className="bg-[#a855f7]/20 text-[#a855f7] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">In Development</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 border border-gray-800/50 rounded-xl bg-gradient-to-br from-[#1a1924] to-[#111018]">
              <Cloud size={20} className="text-[#a855f7] mb-3" />
              <h3 className="font-bold text-sm text-white mb-1">Encrypted Cloud Sync</h3>
              <p className="text-xs text-gray-500">Sync your vault across devices using end-to-end encryption. Only you will hold the keys.</p>
            </div>

            <div className="p-4 border border-gray-800/50 rounded-xl bg-gradient-to-br from-[#1a1924] to-[#111018]">
              <Palette size={20} className="text-[#a855f7] mb-3" />
              <h3 className="font-bold text-sm text-white mb-1">Custom Themes</h3>
              <p className="text-xs text-gray-500">Unlock entirely new visual palettes like 'Crimson Blood' and 'Cyberpunk Neon'.</p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
