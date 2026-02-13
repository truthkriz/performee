
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { transposeText } from '../utils/chordUtils';
import { ArrowLeft, Plus, Minus, Settings, Play, Pause, Sparkles } from 'lucide-react';
import { suggestArrangement } from '../services/geminiService';

interface SongViewerProps {
  song: Song;
  onBack: () => void;
  onEdit: () => void;
}

const SongViewer: React.FC<SongViewerProps> = ({ song, onBack, onEdit }) => {
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [customArrangement, setCustomArrangement] = useState<string[]>([]);
  const [isArranging, setIsArranging] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number;
    if (isScrolling) {
      interval = window.setInterval(() => {
        if (scrollRef.current) scrollRef.current.scrollTop += scrollSpeed;
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScrolling, scrollSpeed]);

  const handleAIArrangement = async () => {
    setIsArranging(true);
    const suggestion = await suggestArrangement(song);
    setCustomArrangement(suggestion);
    setIsArranging(false);
  };

  const displaySections = customArrangement.length > 0 
    ? customArrangement.map(name => song.sections.find(s => s.name.toLowerCase() === name.toLowerCase()) || null).filter(Boolean)
    : song.sections;

  const renderContent = (content: string) => {
    const transposed = transposeText(content, transpose);
    const lines = transposed.split('\n');
    
    // Regex yang sama kuatnya untuk mendeteksi chord di UI
    const chordRegex = /(\[[^\]]+\]|[A-G][#b]?(?:maj|min|m|M|dim|aug|sus|add|Δ|ø|°|[0-9\(\)\+#b\-\/])+)/g;

    return (
      <div className="chord-font leading-relaxed tracking-tight" style={{ fontSize: `${fontSize}px` }}>
        {lines.map((line, idx) => {
          const parts = line.split(chordRegex);
          
          return (
            <div key={idx} className="whitespace-pre min-h-[1.2em]">
              {parts.map((part, pIdx) => {
                const isBracketed = part.startsWith('[') && part.endsWith(']');
                const isNakedChord = /^[A-G][#b]?(?:maj|min|m|M|dim|aug|sus|add|Δ|ø|°|[0-9\(\)\+#b\-\/])+$/.test(part);
                
                if (isBracketed || isNakedChord) {
                  const display = isBracketed ? part.slice(1, -1) : part;
                  return (
                    <span key={pIdx} className="text-indigo-400 font-bold">
                      {display}
                    </span>
                  );
                }
                return <span key={pIdx} className="text-slate-300">{part}</span>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d]">
      <div className="sticky top-0 z-20 bg-[#111827] border-b border-slate-800/50 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">{song.title}</h1>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{song.artist} • {song.key} • {song.tempo} BPM</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl h-9">
            <button onClick={() => setFontSize(prev => Math.max(10, prev - 1))} className="px-2 hover:text-white text-slate-500" title="Kecilkan Font">A-</button>
            <button onClick={() => setFontSize(prev => Math.min(30, prev + 1))} className="px-2 hover:text-white text-slate-500 border-r border-slate-800" title="Besarkan Font">A+</button>
            
            <button onClick={() => setTranspose(prev => prev - 1)} className="px-3 hover:bg-slate-800 text-slate-400 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
            <span className="w-10 text-center text-xs font-black text-indigo-400 bg-slate-950 h-full flex items-center justify-center">{transpose > 0 ? `+${transpose}` : transpose}</span>
            <button onClick={() => setTranspose(prev => prev + 1)} className="px-3 hover:bg-slate-800 text-slate-400 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
          </div>

          <button onClick={() => setIsScrolling(!isScrolling)} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isScrolling ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {isScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button onClick={handleAIArrangement} disabled={isArranging} className="flex items-center gap-2 px-4 h-9 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold hover:bg-indigo-600/20 transition-all">
            <Sparkles className="w-3.5 h-3.5" />
            {isArranging ? '...' : 'AI Arrangement'}
          </button>

          <button onClick={onEdit} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-10 max-w-4xl mx-auto w-full scroll-smooth">
        <div className="space-y-10">
          {displaySections.map((section, idx) => (
            <div key={`${section?.id}-${idx}`} className="group">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] bg-slate-800/30 px-3 py-1 rounded-md">{section?.name}</span>
                <div className="h-px flex-1 bg-slate-800/50" />
              </div>
              <div className="pl-2 border-l-2 border-slate-800/30 group-hover:border-indigo-500/30 transition-colors">
                {section && renderContent(section.content)}
              </div>
            </div>
          ))}
          <div className="h-64" />
        </div>
      </div>
    </div>
  );
};

export default SongViewer;
