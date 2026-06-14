import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import GhostEditor from '../components/GhostEditor';
import { saveEntries, getEntries, type DiaryEntry } from '../utils/db';

export default function NewEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingEntry = location.state?.editingEntry as DiaryEntry | undefined;

  const handleSave = async (text: string, mood: string) => {
    try {
      const currentEntries = await getEntries();
      
      let newEntries: DiaryEntry[];
      
      if (editingEntry) {
        // Update existing entry
        newEntries = currentEntries.map(e => 
          e.id === editingEntry.id 
            ? { ...e, text, mood, wordCount: text.trim().split(/\s+/).filter(Boolean).length }
            : e
        );
      } else {
        // Create new entry
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          text,
          mood,
          wordCount: text.trim().split(/\s+/).filter(Boolean).length,
          createdAt: Date.now()
        };
        newEntries = [newEntry, ...currentEntries];
      }
      
      await saveEntries(newEntries);
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="p-6 md:p-10 max-w-4xl mx-auto w-full flex flex-col min-h-screen pt-24 md:pt-10">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{editingEntry ? 'Edit Entry' : 'New Secure Entry'}</h1>
        </div>
        <Shield size={24} className="text-[#a855f7]" />
      </div>

      {/* Editor Component */}
      <div className="flex-1 flex flex-col">
        <GhostEditor 
          onSave={handleSave} 
          initialText={editingEntry?.text} 
          initialMood={editingEntry?.mood} 
        />
      </div>

    </main>
  );
}
