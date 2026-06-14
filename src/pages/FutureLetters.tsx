import { useState, useEffect } from 'react';
import { Mail, Calendar, Lock, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEntries, saveEntries, type DiaryEntry } from '../utils/db';

export default function FutureLetters() {
  const [letters, setLetters] = useState<DiaryEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [text, setText] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    const all = await getEntries();
    // Filter only those that have an unlockDate
    setLetters(all.filter(e => e.unlockDate !== undefined));
  };

  const handleSave = async () => {
    if (!text.trim() || !unlockDate) return;
    
    const unlockTime = new Date(unlockDate).getTime();
    if (unlockTime <= Date.now()) {
      alert("Unlock date must be in the future!");
      return;
    }

    const newLetter: DiaryEntry = {
      id: Date.now().toString(),
      text,
      mood: 'Calm',
      wordCount: text.trim().split(/\s+/).length,
      createdAt: Date.now(),
      unlockDate: unlockTime
    };

    const all = await getEntries();
    await saveEntries([newLetter, ...all]);
    
    setText('');
    setUnlockDate('');
    setIsWriting(false);
    loadLetters();
  };

  const calculateRemaining = (targetTime: number) => {
    const diff = targetTime - Date.now();
    if (diff <= 0) return 'Unlocked';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
  };

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8 relative pt-24 md:pt-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors p-2 md:hidden">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Mail size={32} className="text-[#a855f7]" />
              <h1 className="text-3xl font-bold text-white">Future Letters</h1>
            </div>
            <p className="text-gray-400">Send encrypted thoughts into the future. They remain mathematically locked until the exact date arrives.</p>
          </div>
        </div>
        {!isWriting && (
          <button onClick={() => setIsWriting(true)} className="hidden md:flex bg-[#a855f7] hover:bg-[#b066f8] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            Write Letter
          </button>
        )}
      </div>

      {!isWriting && (
          <button onClick={() => setIsWriting(true)} className="md:hidden w-full bg-[#a855f7] hover:bg-[#b066f8] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            Write Letter
          </button>
        )}

      {isWriting ? (
        <div className="bg-[#111018] rounded-2xl border border-[#a855f7]/30 shadow-2xl p-6 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-[#a855f7]" /> Choose Delivery Date
          </h2>
          <input 
            type="date" 
            value={unlockDate}
            onChange={e => setUnlockDate(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // min tomorrow
            className="w-full bg-[#1a1924] border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-[#a855f7] transition-colors"
          />
          
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a message to your future self..."
            className="w-full min-h-[300px] bg-[#1a1924] border border-gray-700 rounded-xl p-6 text-white focus:outline-none focus:border-[#a855f7] transition-colors custom-scrollbar resize-none"
          />
          
          <div className="flex gap-4">
            <button onClick={() => setIsWriting(false)} className="flex-1 bg-transparent hover:bg-gray-800 text-gray-400 border border-gray-700 py-4 rounded-xl font-bold transition-colors">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={!text.trim() || !unlockDate}
              className="flex-1 bg-[#a855f7] hover:bg-[#b066f8] disabled:opacity-50 disabled:hover:bg-[#a855f7] text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Lock size={18} /> Seal Letter
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 bg-[#111018] rounded-2xl border border-gray-800/50">
              <Mail size={48} className="mb-4 opacity-30" />
              <p>You haven't sent any letters to the future yet.</p>
            </div>
          ) : (
            letters.map(letter => {
              const isUnlocked = Date.now() >= (letter.unlockDate || 0);
              return (
                <div key={letter.id} className="bg-[#111018] rounded-2xl border border-gray-800/80 p-6 flex flex-col relative overflow-hidden group hover:border-gray-600 transition-colors">
                  {!isUnlocked && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#1a1924] w-12 h-12 rounded-xl flex items-center justify-center border border-gray-800">
                      {isUnlocked ? <Mail size={24} className="text-[#a855f7]" /> : <Lock size={24} className="text-gray-500" />}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Opens On</div>
                      <div className="text-white font-bold">{new Date(letter.unlockDate!).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-6">
                    {isUnlocked ? (
                      <p className="text-gray-300 text-sm line-clamp-4">{letter.text}</p>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2 mt-4">
                        <Clock size={32} className="opacity-30" />
                        <div className="text-sm font-bold">{calculateRemaining(letter.unlockDate!)}</div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    disabled={!isUnlocked}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${isUnlocked ? 'bg-[#2a1d45] text-[#a855f7] hover:bg-[#3a2860]' : 'bg-[#1a1924] text-gray-600 cursor-not-allowed border border-gray-800'}`}
                  >
                    {isUnlocked ? 'Read Letter' : 'Sealed'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

    </main>
  );
}
