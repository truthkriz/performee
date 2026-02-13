
import React, { useState, useRef } from 'react';
import { Song } from '../types';
import { Search, Music, Plus, Clock, Hash, PlayCircle, Download, Upload, CheckSquare, Square, X } from 'lucide-react';

interface SongLibraryProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onAddSong: () => void;
  onEditSong: (song: Song) => void;
  onImportLibrary: (songs: Song[]) => void;
}

const SongLibrary: React.FC<SongLibraryProps> = ({ songs, onSelectSong, onAddSong, onImportLibrary }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSongSelection = (id: string, e: React.MouseEvent) => {
    if (!selectionMode) return;
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleExport = () => {
    const songsToExport = songs.filter(s => selectedIds.has(s.id));
    if (songsToExport.length === 0) return alert("Pilih minimal satu lagu untuk diexport!");

    const blob = new Blob([JSON.stringify(songsToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performee-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Reset selection after export
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportLibrary(imported);
        } else {
          alert("Format file tidak valid.");
        }
      } catch (err) {
        alert("Gagal membaca file export.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const selectAll = () => {
    if (selectedIds.size === filteredSongs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSongs.map(s => s.id)));
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-5xl font-bold text-white tracking-tight">My Songbook</h1>
          <p className="text-slate-500 font-medium">Managing {songs.length} songs in your repertoire</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {!selectionMode ? (
            <>
              <button 
                onClick={handleImportTrigger}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-2xl font-bold transition-all"
                title="Import lagu dari file JSON"
              >
                <Upload className="w-5 h-5" />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button 
                onClick={() => setSelectionMode(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-2xl font-bold transition-all"
                title="Pilih lagu untuk diexport"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button 
                onClick={onAddSong}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Song
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 bg-indigo-600/10 border border-indigo-500/20 p-2 rounded-2xl">
              <span className="px-4 text-sm font-bold text-indigo-400">{selectedIds.size} dipilih</span>
              <button onClick={selectAll} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl">
                {selectedIds.size === filteredSongs.length ? 'Batal Semua' : 'Pilih Semua'}
              </button>
              <button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-bold">
                Export Sekarang
              </button>
              <button onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }} className="p-2 hover:bg-slate-800 rounded-xl">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      {/* Search Bar */}
      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input 
          type="text"
          placeholder="Search title or artist..."
          className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-200 transition-all placeholder:text-slate-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid Lagu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSongs.map(song => {
          const isSelected = selectedIds.has(song.id);
          return (
            <div 
              key={song.id}
              className={`group relative bg-[#111827]/40 hover:bg-[#111827] border rounded-[2rem] p-8 transition-all duration-300 cursor-pointer ${
                isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-800/50 hover:border-indigo-500/40'
              }`}
              onClick={(e) => selectionMode ? toggleSongSelection(song.id, e) : onSelectSong(song)}
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-600/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'
                }`}>
                  <Music className="w-7 h-7" />
                </div>
                {selectionMode && (
                  <div onClick={(e) => toggleSongSelection(song.id, e)} className="p-2">
                    {isSelected ? (
                      <CheckSquare className="w-6 h-6 text-indigo-500" />
                    ) : (
                      <Square className="w-6 h-6 text-slate-600 hover:text-indigo-400" />
                    )}
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{song.title}</h3>
              <p className="text-slate-500 font-semibold mb-8 text-lg">{song.artist}</p>

              <div className="flex items-center gap-8 mb-8 border-t border-slate-800/30 pt-8">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Hash className="w-4 h-4" /> {song.key}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Clock className="w-4 h-4" /> {song.tempo}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <PlayCircle className="w-4 h-4" /> {song.sections.length}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {song.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-widest font-black text-slate-600 bg-slate-800/30 px-3 py-1.5 rounded-lg group-hover:bg-slate-800 group-hover:text-slate-400 transition-all">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="absolute -bottom-6 -right-6 text-slate-800/10 font-black text-7xl select-none pointer-events-none group-hover:text-indigo-500/5 transition-all">
                 SONG
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SongLibrary;
