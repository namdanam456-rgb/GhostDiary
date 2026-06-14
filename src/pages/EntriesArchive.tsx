import { useState, useEffect } from 'react';
import { Lock, Smile, Frown, Coffee, Flame, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEntries, deleteEntry, type DiaryEntry } from '../utils/db';

export default function EntriesArchive() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    getEntries().then(setEntries).catch(console.error);
  };

  const handleDelete = async () => {
    if (!viewingEntry) return;
    if (window.confirm('Are you sure you want to permanently delete this entry?')) {
      await deleteEntry(viewingEntry.id);
      setViewingEntry(null);
      loadEntries();
    }
  };

  const handleExport = () => {
    if (!viewingEntry) return;
    const dataStr = `Date: ${new Date(viewingEntry.createdAt).toLocaleString()}\nMood: ${viewingEntry.mood}\n\n${viewingEntry.text}`;
    const blob = new Blob([dataStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GhostDiary_Entry_${viewingEntry.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    navigate('/new', { state: { editingEntry: viewingEntry } });
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'Happy': return <Smile className="text-yellow-400" size={18} />;
      case 'Sad': return <Frown className="text-blue-400" size={18} />;
      case 'Calm': return <Coffee className="text-emerald-400" size={18} />;
      case 'Stressed': return <Flame className="text-purple-400" size={18} />;
      default: return <Smile className="text-yellow-400" size={18} />;
    }
  };

  return (
    <main className="p-6 md:p-10 max-w-4xl mx-auto w-full flex flex-col min-h-screen pt-24 md:pt-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors p-2 md:hidden">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Entries Archive</h1>
          <p className="text-gray-400">All your encrypted thoughts, safe in one place.</p>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-[#111018] rounded-3xl border border-gray-800/50 p-6 shadow-2xl flex-1 flex flex-col gap-3">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-500 py-20">
            <Lock size={32} className="mb-4 opacity-50" />
            <p>Your vault is currently empty.</p>
          </div>
        ) : (
          entries.map(entry => (
            <div 
              key={entry.id} 
              onClick={() => setViewingEntry(entry)}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-[#1a1924] transition-colors cursor-pointer group border border-transparent hover:border-[#a855f7]/20"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 rounded-full bg-[#1a1924] flex items-center justify-center group-hover:bg-[#2a283e] transition-colors shrink-0">
                  <Lock size={16} className="text-gray-400 group-hover:text-white" />
                </div>
                <div>
                  <div className="text-base font-bold mb-0.5 text-gray-200 group-hover:text-white transition-colors">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {entry.wordCount} words
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1924]">
                  {getMoodIcon(entry.mood)}
                  <span className="text-sm font-medium text-gray-300">{entry.mood}</span>
                </div>
                <Lock size={18} className="text-[#a855f7]/50 group-hover:text-[#a855f7] transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Entry Modal (Reused exactly from Dashboard) */}
      {viewingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60">
          <div className="w-full max-w-[600px] bg-[#111018] border border-gray-800 rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <button onClick={() => setViewingEntry(null)} className="text-gray-400 hover:text-white transition-colors mr-2">
                  <X size={20} />
                </button>
                <h2 className="font-bold text-lg">Entry Viewer</h2>
              </div>
              <div className="flex items-center gap-4">
                <Lock size={16} className="text-emerald-400" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </div>
            </div>
            
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-lg mb-1">{new Date(viewingEntry.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div className="text-sm text-gray-500">{new Date(viewingEntry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className="flex items-center gap-2 bg-[#1a1924] px-3 py-1.5 rounded-lg border border-gray-800">
                {getMoodIcon(viewingEntry.mood)}
                <span className="text-sm font-bold">{viewingEntry.mood}</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-[15px]">
                {viewingEntry.text}
              </p>
              
              <div className="mt-8 pt-6 border-t border-gray-800/50">
                <p className="text-sm text-gray-500 italic">Privacy is not just a feature, it's a promise. 💜</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-800 flex gap-4">
              <button onClick={handleEdit} className="flex-1 flex items-center justify-center gap-2 bg-[#2a1d45] hover:bg-[#3a2860] text-[#a855f7] py-3 rounded-xl font-bold transition-colors"><Lock size={16} /> Edit</button>
              <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 bg-[#1a1924] hover:bg-[#2a283e] text-white py-3 rounded-xl font-bold transition-colors"><Lock size={16} /> Export</button>
              <button onClick={handleDelete} className="flex-1 flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-3 rounded-xl font-bold transition-colors"><Lock size={16} /> Delete</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
