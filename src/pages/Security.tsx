import { Shield, Key, EyeOff, Lock, ServerOff, Code, HardDrive, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Security() {
  const navigate = useNavigate();

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8 relative pt-24 md:pt-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors p-2 md:hidden">
          <ArrowLeft size={20} />
        </button>
        <header>
          <div className="flex items-center gap-3 mb-2">
            <Shield size={32} className="text-[#a855f7]" />
            <h1 className="text-3xl font-bold text-white">Security & Privacy</h1>
          </div>
          <p className="text-gray-400 max-w-2xl">
            GhostDiary is built with a zero-trust architecture. We cannot read your entries because your data never leaves your device and is heavily encrypted before it even touches your local hard drive.
          </p>
        </header>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* AES Encryption */}
        <div className="bg-[#111018] rounded-2xl p-6 md:p-8 border border-gray-800/50 shadow-xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2a1d45] flex items-center justify-center border border-[#a855f7]/30">
            <Code size={24} className="text-[#a855f7]" />
          </div>
          <h2 className="text-xl font-bold text-white">AES-256-GCM Encryption</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Every entry you write is encrypted using the military-grade AES-256-GCM standard via the Web Crypto API. The encryption happens instantly in your browser's memory before the data is saved. Without your Master Password, your entries are mathematically impossible to decrypt.
          </p>
        </div>

        {/* Local Storage */}
        <div className="bg-[#111018] rounded-2xl p-6 md:p-8 border border-gray-800/50 shadow-xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1a1924] flex items-center justify-center border border-gray-700">
            <HardDrive size={24} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-white">Local-First Storage</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            We use <span className="text-white font-medium">IndexedDB</span> to store your encrypted vault directly on your local device. There are no databases, no cloud servers, and no data harvesting. Your diary is truly yours, physically residing only on the hardware you control.
          </p>
        </div>

        {/* Zero Network */}
        <div className="bg-[#111018] rounded-2xl p-6 md:p-8 border border-gray-800/50 shadow-xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-900/20 flex items-center justify-center border border-emerald-500/30">
            <ServerOff size={24} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Zero Cloud Connection</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            GhostDiary is a 100% offline application. It makes absolutely zero network requests to external servers once loaded. You can turn off your Wi-Fi and the app will function perfectly, guaranteeing no data can leak out.
          </p>
        </div>

        {/* Panic Lock */}
        <div className="bg-[#111018] rounded-2xl p-6 md:p-8 border border-gray-800/50 shadow-xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-900/20 flex items-center justify-center border border-red-500/30">
            <EyeOff size={24} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Panic Lock Mechanism</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            If you are in a compromised situation, pressing <kbd className="bg-[#0b0a10] px-2 py-1 rounded text-xs border border-gray-700">ESC</kbd> three times will instantly trigger the Panic Lock. This purges your decrypted vault from memory and overlays an innocent Tic-Tac-Toe game on your screen to mask your activity.
          </p>
        </div>

      </div>

      {/* Tech Stack Banner */}
      <div className="bg-gradient-to-r from-[#2a0e5b] to-[#4c1d95] rounded-2xl p-6 border border-[#a855f7]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(168,85,247,0.1)] mt-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
            <Key size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Your Keys, Your Data</h3>
            <p className="text-[#d8b4fe] text-sm">We don't know your password. If you lose it, we cannot help you recover it.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-[#a855f7]" />
          <span className="text-sm font-bold text-white tracking-widest uppercase">Verified Secure</span>
        </div>
      </div>

    </main>
  );
}
