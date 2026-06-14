import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, FileText, Lock, Edit3, Smile, Frown, Coffee, X } from 'lucide-react';
import { getEntries, isUnlocked, saveEntries, deleteEntry, type DiaryEntry } from '../utils/db';
import GhostEditor from '../components/GhostEditor';
import TutorialModal from '../components/TutorialModal';

export default function Dashboard() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  const navigate = useNavigate();

  const loadEntries = () => {
    getEntries().then(setEntries).catch(console.error);
  };

  useEffect(() => {
    if (!isUnlocked()) {
      navigate('/auth');
      return;
    }
    loadEntries();
  }, [navigate]);

  const totalEntries = entries.length;

  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    const sortedDates = entries
      .map(e => new Date(e.createdAt))
      .sort((a, b) => b.getTime() - a.getTime());
      
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let targetDate = new Date(today);
    const latest = new Date(sortedDates[0]);
    latest.setHours(0,0,0,0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (latest.getTime() !== today.getTime() && latest.getTime() !== yesterday.getTime()) {
      return 0;
    }
    
    if (latest.getTime() === yesterday.getTime()) {
      targetDate = yesterday;
    }

    for (let i = 0; i < sortedDates.length; i++) {
      const d = new Date(sortedDates[i]);
      d.setHours(0, 0, 0, 0);
      
      if (d.getTime() === targetDate.getTime()) {
        streak++;
        targetDate.setDate(targetDate.getDate() - 1);
      } else if (d.getTime() < targetDate.getTime()) {
        break;
      }
    }
    return streak;
  };

  const getMoodStats = () => {
    if (entries.length === 0) return { Happy: 0, Sad: 0, Calm: 0, Stressed: 0 };
    
    const counts: Record<string, number> = { Happy: 0, Sad: 0, Calm: 0, Stressed: 0 };
    entries.forEach(e => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    
    return counts;
  };

  const streak = calculateStreak();
  const currentMood = entries.length > 0 ? entries[0].mood : 'Unknown';
  const moodStats = getMoodStats();
  
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'Happy': return <Smile className="text-yellow-400" size={20} />;
      case 'Sad': return <Frown className="text-blue-400" size={20} />;
      case 'Calm': return <Coffee className="text-emerald-400" size={20} />;
      case 'Stressed': return <Flame className="text-red-400" size={20} />;
      default: return <Smile className="text-yellow-400" size={20} />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'Happy': return '#facc15';
      case 'Sad': return '#60a5fa';
      case 'Calm': return '#34d399';
      case 'Stressed': return '#f87171';
      default: return '#facc15';
    }
  };

  const renderDoughnut = () => {
    const total = Object.values(moodStats).reduce((a, b) => a + b, 0);
    if (total === 0) return <div className="w-40 h-40 rounded-full border-[12px] border-gray-800"></div>;

    let cumulativePercent = 0;
    const slices = Object.entries(moodStats).map(([mood, count]) => {
      const percent = count / total;
      const dashArray = `${percent * 100} 100`;
      const dashOffset = -cumulativePercent * 100;
      cumulativePercent += percent;
      
      return (
        <circle
          key={mood}
          cx="21"
          cy="21"
          r="15.91549430918954"
          fill="transparent"
          stroke={getMoodColor(mood)}
          strokeWidth="6"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          className="transition-all duration-500 ease-out"
        ></circle>
      );
    });

    return (
      <svg width="100%" height="100%" viewBox="0 0 42 42" className="drop-shadow-lg -rotate-90">
        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#1f1e29" strokeWidth="6"></circle>
        {slices}
      </svg>
    );
  };

  const handleQuickSave = async (text: string, mood: string) => {
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      text,
      mood,
      wordCount: text.trim().split(/\s+/).length,
      createdAt: Date.now()
    };
    
    const newEntries = [newEntry, ...entries];
    await saveEntries(newEntries);
    setEntries(newEntries);
    setIsModalOpen(false);
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

  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 relative pb-24 md:pb-10 pt-24 md:pt-10">
      <TutorialModal />
      
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold mb-1">Good Evening, Ghost <span className="inline-block hover:animate-bounce cursor-default">👋</span></h1>
        <p className="text-gray-400">You've protected your thoughts for {streak} days.</p>
      </header>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Entries Card */}
        <div className="bg-[#111018] rounded-2xl p-6 border border-gray-800/50 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Entries</span>
            <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 flex items-center justify-center">
              <FileText size={16} className="text-[#a855f7]" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{totalEntries}</div>
          <div className="text-xs text-gray-500">Total Entries</div>
        </div>

        {/* Streak Card */}
        <div className="bg-[#111018] rounded-2xl p-6 border border-gray-800/50 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Streak</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
              <Flame size={16} className="text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{streak} Days</div>
          <div className="text-xs text-gray-500">Keep going!</div>
        </div>

        {/* Current Mood Card */}
        <div className="bg-[#111018] rounded-2xl p-6 border border-gray-800/50 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">Current Mood</span>
          </div>
          <div className="flex items-center gap-3 mt-1 mb-1">
            <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center">
              {getMoodIcon(currentMood)}
            </div>
            <div className="text-2xl font-bold">{currentMood}</div>
          </div>
          <div className="text-xs text-gray-500">Today</div>
        </div>
      </section>

      {/* New Secure Entry Banner */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-gradient-to-r from-[#2a0e5b] to-[#4c1d95] rounded-2xl p-6 border border-[#a855f7]/30 flex items-center justify-between group hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Edit3 size={20} className="text-[#e9ddff]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">New Secure Entry</h2>
            <p className="text-sm text-gray-300">Start writing your thoughts...</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#a855f7] transition-colors">
          <Edit3 size={18} className="text-white" />
        </div>
      </button>

      {/* Two Column Split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Entries */}
        <div className="bg-[#111018] rounded-2xl p-6 border border-gray-800/50 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Recent Entries</h3>
            <button className="text-xs font-bold text-[#a855f7] hover:text-[#c084fc]">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
            {entries.length === 0 ? (
              <p className="text-sm text-gray-500 my-auto text-center">No entries yet.</p>
            ) : (
              entries.map(entry => (
                <div 
                  key={entry.id} 
                  onClick={() => setViewingEntry(entry)}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-[#1a1924] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#1a1924] flex items-center justify-center group-hover:bg-[#2a283e] transition-colors">
                      <Lock size={14} className="text-gray-400 group-hover:text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold mb-0.5">{new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {entry.wordCount} words</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getMoodIcon(entry.mood)}
                      <span className="text-sm font-medium text-gray-300">{entry.mood}</span>
                    </div>
                    <Lock size={16} className="text-gray-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mood Overview */}
        <div className="bg-[#111018] rounded-2xl p-6 border border-gray-800/50 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold">Mood Overview</h3>
            <button className="text-xs font-medium text-gray-400 flex items-center gap-1">
              This Week <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center gap-12">
            <div className="w-48 h-48 relative">
              {renderDoughnut()}
            </div>
            <div className="flex flex-col gap-4">
              {Object.entries(moodStats).map(([mood, count]) => {
                if (count === 0) return null;
                const percent = Math.round((count / entries.length) * 100);
                return (
                  <div key={mood} className="flex items-center gap-6 justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getMoodColor(mood) }}></div>
                      <span className="text-sm text-gray-300">{mood}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60">
          <div className="w-full max-w-[800px] bg-[#0b0a10] border border-gray-800 rounded-2xl p-0 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#111018]">
              <h2 className="font-bold text-lg">New Secure Entry</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <GhostEditor onSave={handleQuickSave} />
            </div>
          </div>
        </div>
      )}

      {/* View Entry Modal */}
      {viewingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60">
          <div className="w-full max-w-[600px] bg-[#111018] border border-gray-800 rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <button onClick={() => setViewingEntry(null)} className="text-gray-400 hover:text-white transition-colors mr-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
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
