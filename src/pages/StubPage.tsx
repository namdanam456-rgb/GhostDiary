import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StubPage({ title }: { title: string }) {
  const navigate = useNavigate();

  return (
    <main className="p-6 md:p-10 max-w-4xl mx-auto w-full flex flex-col min-h-[80vh] pt-24 md:pt-10">
      <div className="bg-[#111018] rounded-3xl border border-gray-800/50 p-8 flex flex-col items-center justify-center flex-1 shadow-2xl relative overflow-hidden group">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800 group-hover:border-[#a855f7]/50 transition-colors">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-[#a855f7]"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-gray-500 text-center max-w-sm">This module is currently being calibrated for the new GhostDiary v3 aesthetic. Please check back later.</p>
      </div>
    </main>
  );
}
