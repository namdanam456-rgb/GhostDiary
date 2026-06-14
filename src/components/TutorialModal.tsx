import { useState, useEffect } from 'react';
import { Shield, EyeOff, ServerOff, CheckCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';

export default function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem('ghostdiary_tutorial_seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('ghostdiary_tutorial_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const slides = [
    {
      icon: <Shield size={48} className="text-[#a855f7]" />,
      title: "Welcome to GhostDiary",
      desc: "Your thoughts are safe here. Everything you write is encrypted instantly using military-grade AES-256 before it ever touches your hard drive."
    },
    {
      icon: <EyeOff size={48} className="text-red-400" />,
      title: "Panic Lock & Ghost Mode",
      desc: "Tap ESC 3 times to instantly purge memory and lock the app. While writing, words will automatically mask themselves to protect against shoulder-surfing."
    },
    {
      icon: <ServerOff size={48} className="text-emerald-400" />,
      title: "100% Offline & Private",
      desc: "GhostDiary has zero cloud connection. Your vault exists solely on this device. If you lose your password, your entries are mathematically unrecoverable."
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 backdrop-blur-md bg-black/80">
      <div className="w-full max-w-md bg-[#111018] border border-gray-800 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden flex flex-col">
        
        {/* Progress Bar */}
        <div className="flex w-full h-1 bg-gray-900">
          <div 
            className="h-full bg-gradient-to-r from-[#a855f7] to-[#d8b4fe] transition-all duration-300"
            style={{ width: `${((step + 1) / slides.length) * 100}%` }}
          />
        </div>

        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center mt-4">
          <div className="w-20 h-20 rounded-2xl bg-[#1a1924] border border-gray-800 flex items-center justify-center mb-6 shadow-inner">
            {slides[step].icon}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">{slides[step].title}</h2>
          <p className="text-gray-400 leading-relaxed text-[15px] min-h-[80px]">
            {slides[step].desc}
          </p>
        </div>

        <div className="p-6 border-t border-gray-800/80 bg-[#0b0a10] flex items-center justify-between">
          <button 
            onClick={() => setStep(s => Math.max(0, s - 1))}
            className={`p-3 rounded-xl transition-colors ${step === 0 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-[#1a1924]'}`}
            disabled={step === 0}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-[#a855f7]' : 'bg-gray-800'}`} />
            ))}
          </div>

          <button 
            onClick={() => {
              if (step === slides.length - 1) handleClose();
              else setStep(s => Math.min(slides.length - 1, s + 1));
            }}
            className="px-6 py-3 bg-[#a855f7] hover:bg-[#b066f8] text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95"
          >
            {step === slides.length - 1 ? (
              <>Start Writing <CheckCircle size={18} /></>
            ) : (
              <>Next <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
