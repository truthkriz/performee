import React, { useState, useRef, useMemo } from 'react';
import { Song } from '../types';
import { Search, Music, Plus, Clock, Hash, Download, Upload, CheckSquare, Square, X, Edit2, Trash2, MoreVertical } from 'lucide-react';

interface SongLibraryProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onAddSong: () => void;
  onEditSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
  onImportLibrary: (songs: Song[]) => void;
}

const SongLibrary: React.FC<SongLibraryProps> = ({ songs, onSelectSong, onAddSong, onEditSong, onDeleteSong, onImportLibrary }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sorting A-Z berdasarkan Judul
  const sortedAndFilteredSongs = useMemo(() => {
    return songs
      .filter(s => 
        s.title.toLowerCase().includes(search.toLowerCase()) || 
        s.artist.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [songs, search]);

  const toggleSongSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleExport = () => {
    const songsToExport = songs.filter(s => selectedIds.has(s.id));
    if (songsToExport.length === 0) {
      alert("Pilih lagu untuk diexport!");
      return;
    }
    const dataStr = JSON.stringify(songsToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performee-songs.json`;
    link.click();
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleImportTrigger = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) onImportLibrary(imported);
      } catch (err) { alert("File tidak valid."); }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compact */}
      <div className="px-6 py-6 border-b border-slate-800 bg-[#0f172a]/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Library</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">{songs.length} Total Repertoire</p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            {!selectionMode ? (
              <>
                <button 
                  onClick={handleImportTrigger}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                >
                  <Upload className="w-4 h-4" /> Import
                </button>
                <button 
                  onClick={() => setSelectionMode(true)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <button 
                  onClick={onAddSong}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 p-1.5 rounded-xl">
                <span className="px-3 text-xs font-bold text-indigo-400">{selectedIds.size} Selected</span>
                <button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg text-xs font-bold">Export</button>
                <button onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }} className="p-1.5 hover:bg-slate-800 rounded-lg">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by title or artist..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-6 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm text-slate-300 transition-all placeholder:text-slate-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

      {/* List Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto bg-[#0a0f1d]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0a0f1d] z-10">
            <tr className="border-b border-slate-800/50 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
              {selectionMode && <th className="px-6 py-4 w-10">Select</th>}
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4 hidden md:table-cell">Artist</th>
              <th className="px-6 py-4 text-center w-20">Key</th>
              <th className="px-6 py-4 text-center w-20 hidden sm:table-cell">Tempo</th>
              <th className="px-6 py-4 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredSongs.map(song => (
              <tr 
                key={song.id}
                className={`group border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors cursor-pointer ${selectedIds.has(song.id) ? 'bg-indigo-600/5' : ''}`}
                onClick={() => selectionMode ? null : onSelectSong(song)}
              >
                {selectionMode && (
                  <td className="px-6 py-4" onClick={(e) => toggleSongSelection(song.id, e)}>
                    {selectedIds.has(song.id) ? <CheckSquare className="w-5 h-5 text-indigo-500" /> : <Square className="w-5 h-5 text-slate-700" />}
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{song.title}</div>
                      <div className="text-[11px] text-slate-500 md:hidden">{song.artist}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-slate-400 font-medium">{song.artist}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs font-black text-slate-500 bg-slate-800/50 px-2 py-1 rounded min-w-[30px] inline-block">{song.key}</span>
                </td>
                <td className="px-6 py-4 text-center hidden sm:table-cell">
                  <span className="text-xs font-bold text-slate-500">{song.tempo}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditSong(song); }}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 transition-all"
                      title="Edit Song"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteSong(song.id); }}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                      title="Delete Song"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedAndFilteredSongs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <Music className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No songs found in your library.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongLibrary;
