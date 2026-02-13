
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { transposeText } from '../utils/chordUtils';
import { ArrowLeft, Plus, Minus, Settings, Play, Pause, ListOrdered, Sparkles } from 'lucide-react';
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
        if (scrollRef.current) {
          scrollRef.current.scrollTop += scrollSpeed;
        }
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
    // Transpose the text first
    const transposed = transposeText(content, transpose);
    
    // Split into lines and render using pre-wrap to preserve spacing
    // We wrap chords in spans for coloring
    const lines = transposed.split('\n');
    
    return (
      <div className="chord-font leading-relaxed">
        {lines.map((line, idx) => {
          // Identify chords to highlight them
          // Matches bracketed [G] or common standalone chord patterns
          const parts = line.split(/(\[[^\]]+\]|\b[A-G][#b]?(?:m|maj|min|aug|dim|sus|add|M)?(?:\d+)?(?:(?:\/)[A-G][#b]?)?\b)/g);
          
          return (
            <div key={idx} className="whitespace-pre-wrap min-h-[1.2em]">
              {parts.map((part, pIdx) => {
                const isBracketed = part.startsWith('[') && part.endsWith(']');
                const isNakedChord = /^[A-G][#b]?(?:m|maj|min|aug|dim|sus|add|M)?(?:\d+)?(?:(?:\/)[A-G][#b]?)?$/.test(part);
                
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
    <div className="flex flex-col h-full bg-slate-900">
      <div className="sticky top-0 z-20 bg-slate-800 border-b border-slate-700 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{song.title}</h1>
            <p className="text-sm text-slate-400">{song.artist} • Original: {song.key} • {song.tempo} BPM</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">
            <span className="text-xs font-semibold px-2 text-slate-500 uppercase">Transpose</span>
            <button onClick={() => setTranspose(prev => prev - 1)} className="p-1 hover:bg-slate-700 rounded"><Minus className="w-4 h-4" /></button>
            <span className="w-8 text-center font-bold text-indigo-400">{transpose > 0 ? `+${transpose}` : transpose}</span>
            <button onClick={() => setTranspose(prev => prev + 1)} className="p-1 hover:bg-slate-700 rounded"><Plus className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">
            <span className="text-xs font-semibold px-2 text-slate-500 uppercase">Size</span>
            <button onClick={() => setFontSize(prev => Math.max(10, prev - 2))} className="p-1 hover:bg-slate-700 rounded"><Minus className="w-4 h-4" /></button>
            <span className="w-6 text-center text-slate-300 text-sm">{fontSize}</span>
            <button onClick={() => setFontSize(prev => Math.min(40, prev + 2))} className="p-1 hover:bg-slate-700 rounded"><Plus className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsScrolling(!isScrolling)}
              className={`p-2 rounded-full transition-colors ${isScrolling ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              {isScrolling ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <input 
              type="range" min="1" max="10" 
              className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleAIArrangement}
              disabled={isArranging}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm font-medium hover:bg-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {isArranging ? '...' : 'AI Arrangement'}
            </button>
            <button onClick={onEdit} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-10 max-w-5xl mx-auto w-full scroll-smooth"
      >
        <div className="space-y-12" style={{ fontSize }}>
          {displaySections.map((section, idx) => (
            <div key={`${section?.id}-${idx}`} className="group">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-slate-800 group-hover:bg-indigo-500/30 transition-colors" />
                <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase px-4 py-1 rounded bg-slate-800/50">
                  {section?.name}
                </h3>
                <div className="h-px flex-1 bg-slate-800 group-hover:bg-indigo-500/30 transition-colors" />
              </div>
              <div className="pl-4">
                {section && renderContent(section.content)}
              </div>
            </div>
          ))}
          <div className="h-96" />
        </div>
      </div>

      <div className="fixed right-6 top-32 bottom-32 w-12 flex flex-col items-center justify-center gap-2 opacity-30 hover:opacity-100 transition-opacity pointer-events-none sm:pointer-events-auto">
        <div className="bg-slate-800 border border-slate-700 rounded-full p-2 flex flex-col gap-2 shadow-2xl">
          {displaySections.map((s, idx) => (
            <div 
              key={idx} 
              title={s?.name}
              className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 hover:bg-indigo-600 hover:text-white cursor-pointer transition-all pointer-events-auto"
              onClick={() => {
                const elements = scrollRef.current?.querySelectorAll('.group');
                if (elements && elements[idx]) {
                  elements[idx].scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {s?.name?.substring(0, 1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SongViewer;
