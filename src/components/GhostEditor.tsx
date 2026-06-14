import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Lock, Calendar, Smile, Frown, Coffee, Flame, ChevronDown, Ghost } from 'lucide-react';

interface GhostEditorProps {
  onSave: (text: string, mood: string) => void;
  initialText?: string;
  initialMood?: string;
}

interface MaskedWord {
  id: string;
  word: string;
  timestamp: number;
  isMasked: boolean;
  isSpace: boolean;
  isNewline: boolean;
}

export default function GhostEditor({ onSave, initialText = '', initialMood = 'Happy' }: GhostEditorProps) {
  const [text, setText] = useState(initialText);
  const [mood, setMood] = useState(initialMood);
  const [words, setWords] = useState<MaskedWord[]>([]);
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MASK_DELAY_MS = 5000;

  useEffect(() => {
    const rawTokens = text.match(/(\S+|\s+)/g) || [];
    const now = Date.now();
    
    setWords(prev => {
      const newWords: MaskedWord[] = [];
      for (let i = 0; i < rawTokens.length; i++) {
        const token = rawTokens[i];
        const isSpace = /^[ \t]+$/.test(token);
        const isNewline = /\n/.test(token);
        
        const existing = prev[i];
        if (existing && existing.word === token) {
          newWords.push(existing);
        } else {
          newWords.push({
            id: `${i}-${now}`,
            word: token,
            timestamp: now,
            isMasked: false,
            isSpace,
            isNewline
          });
        }
      }
      return newWords;
    });
  }, [text]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setWords(prev => {
        let changed = false;
        const next = prev.map(w => {
          if (!w.isMasked && !w.isSpace && !w.isNewline && now - w.timestamp > MASK_DELAY_MS) {
            changed = true;
            return { ...w, isMasked: true };
          }
          return w;
        });
        return changed ? next : prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleSave = () => {
    if (text.trim()) {
      onSave(text, mood);
      if (!initialText) {
        setText('');
        setWords([]);
      }
    }
  };

  const moods = [
    { name: 'Happy', icon: <Smile size={18} className="text-yellow-400" /> },
    { name: 'Sad', icon: <Frown size={18} className="text-blue-400" /> },
    { name: 'Calm', icon: <Coffee size={18} className="text-emerald-400" /> },
    { name: 'Stressed', icon: <Flame size={18} className="text-purple-400" /> },
  ];

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* Date & Mood Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111018] border border-gray-800/80 rounded-xl p-4 flex items-center justify-between text-white cursor-not-allowed opacity-80">
          <span className="font-medium text-sm">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <Calendar size={18} className="text-gray-500" />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsMoodOpen(!isMoodOpen)}
            className="w-full bg-[#111018] border border-gray-800/80 rounded-xl p-4 flex items-center justify-between hover:bg-[#1a1924] transition-colors group"
          >
            <div className="flex items-center gap-3">
              {moods.find(m => m.name === mood)?.icon}
              <span className="font-medium text-sm text-white">{mood}</span>
            </div>
            <ChevronDown size={18} className="text-gray-500 group-hover:text-white transition-colors" />
          </button>
          
          {isMoodOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#111018] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-20">
              {moods.map(m => (
                <button
                  key={m.name}
                  onClick={() => { setMood(m.name); setIsMoodOpen(false); }}
                  className="w-full p-4 flex items-center gap-3 hover:bg-[#1a1924] transition-colors text-left text-white"
                >
                  {m.icon}
                  <span className="font-medium text-sm">{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-[#111018] border border-gray-800/80 rounded-2xl relative min-h-[300px] shadow-inner overflow-hidden">
        {/* Render Layer (Visual) */}
        <div 
          ref={containerRef}
          className="absolute inset-0 p-6 pointer-events-none overflow-hidden whitespace-pre-wrap break-words font-body-lg text-[16px] leading-[1.8] text-white"
          aria-hidden="true"
        >
          {words.map(w => {
            if (w.isNewline) return <br key={w.id} />;
            if (w.isSpace) return <span key={w.id}>{w.word}</span>;
            
            if (w.isMasked) {
              // Exact mockup match: solid purple block `#5b21b6`
              // Use block characters for robust layout masking
              return (
                <span key={w.id} className="bg-[#5b21b6] text-[#5b21b6] rounded-[2px] px-0.5 mx-0.5 inline-block select-none" style={{ height: '1.2em', verticalAlign: 'middle' }}>
                  {w.word.replace(/./g, '█')}
                </span>
              );
            }
            return <span key={w.id} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{w.word}</span>;
          })}
        </div>
        
        {/* Input Layer (Interactive) */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full p-6 bg-transparent text-transparent caret-white resize-none outline-none font-body-lg text-[16px] leading-[1.8] custom-scrollbar"
          placeholder={text ? "" : "Start writing your thoughts..."}
          spellCheck={false}
        />
      </div>

      {/* Info Row */}
      <div className="bg-[#111018] border border-gray-800/80 rounded-2xl p-6 flex justify-between items-center text-center">
        <div>
          <div className="text-xs text-gray-500 font-medium mb-1">Words</div>
          <div className="text-xl font-bold text-white">{wordCount}</div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="bg-[#a855f7]/10 text-[#a855f7] px-4 py-2 rounded-xl flex items-center gap-2 border border-[#a855f7]/20">
            <Ghost size={16} />
            <span className="font-bold text-xs uppercase tracking-wider">Ghost Mode ACTIVE</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium mb-1">Characters</div>
          <div className="text-xl font-bold text-white">{charCount}</div>
        </div>
      </div>

      {/* Buttons Row */}
      <div className="grid grid-cols-2 gap-4">
        <button disabled className="bg-[#111018] border border-gray-800/80 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-500 font-bold transition-colors cursor-not-allowed opacity-70">
          <Mic size={18} className="text-gray-600" /> Voice Mode
          <span className="bg-[#2a1d45] text-[#a855f7] text-[10px] px-2 py-0.5 rounded-full ml-1 uppercase tracking-widest border border-[#a855f7]/30 flex items-center gap-1"><Lock size={10} /> Locked</span>
        </button>
        <button className="bg-[#111018] hover:bg-[#1a1924] border border-gray-800/80 rounded-xl p-4 flex items-center justify-center gap-2 text-white font-bold transition-colors">
          <Square size={18} className="text-gray-400 border-dashed border border-gray-400 rounded-sm" /> Blank Mode
        </button>
      </div>

      {/* Save Button */}
      <div className="mt-2 text-center">
        <button 
          onClick={handleSave}
          disabled={!text.trim()}
          className="w-full bg-[#7e22ce] hover:bg-[#9333ea] disabled:opacity-50 disabled:hover:bg-[#7e22ce] text-white rounded-xl py-4 flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_20px_rgba(126,34,206,0.3)] active:scale-[0.99] mb-4"
        >
          <Lock size={18} /> Save Entry
        </button>
        <p className="text-xs text-gray-500 font-medium">Everything is encrypted and stored only on your device.</p>
      </div>

    </div>
  );
}
