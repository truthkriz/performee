import React, { useState, useEffect } from 'react';
import { Song, AppView } from './types';
import { INITIAL_SONGS } from './constants';
import SongLibrary from './components/SongLibrary';
import SongViewer from './components/SongViewer';
import SongEditor from './components/SongEditor';
import { Music, LayoutGrid, ListMusic, User, Info } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('library');
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('performee_songs');
    if (saved) {
      try {
        setSongs(JSON.parse(saved));
      } catch (e) {
        setSongs(INITIAL_SONGS);
      }
    } else {
      setSongs(INITIAL_SONGS);
    }
  }, []);

  useEffect(() => {
    if (songs.length > 0) {
      localStorage.setItem('performee_songs', JSON.stringify(songs));
    }
  }, [songs]);

  const handleSaveSong = (newSong: Song) => {
    setSongs(prev => {
      const exists = prev.find(s => s.id === newSong.id);
      if (exists) return prev.map(s => s.id === newSong.id ? newSong : s);
      return [newSong, ...prev];
    });
    setView('library');
    setActiveSong(null);
  };

  const handleDeleteSong = (id: string) => {
    if (window.confirm("Hapus lagu ini dari library selamanya?")) {
      setSongs(prev => prev.filter(s => s.id !== id));
      if (activeSong?.id === id) setActiveSong(null);
    }
  };

  const handleImportSongs = (importedSongs: Song[]) => {
    setSongs(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const newSongs = importedSongs.filter(s => !existingIds.has(s.id));
      return [...newSongs, ...prev];
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0f1d] text-slate-200">
      {/* Sidebar - Compact Fixed */}
      <nav className="w-16 md:w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col py-6 shrink-0">
        <div className="px-4 md:px-6 mb-10 flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Music className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="hidden md:block text-lg font-bold tracking-tight text-white uppercase">PERFORMEE</span>
        </div>

        <div className="flex-1 px-2 md:px-4 space-y-2">
          <button 
            onClick={() => setView('library')}
            className={`w-full flex items-center justify-center md:justify-start gap-4 px-3 py-3 rounded-xl transition-all ${view === 'library' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400'}`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="hidden md:block font-medium">Library</span>
          </button>
          
          <button className="w-full flex items-center justify-center md:justify-start gap-4 px-3 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 transition-all opacity-20 cursor-not-allowed">
            <ListMusic className="w-5 h-5" />
            <span className="hidden md:block font-medium">Setlists</span>
          </button>
        </div>

        <div className="px-2 md:px-4 mt-auto space-y-1 pt-6 border-t border-slate-800/50">
          <div className="flex items-center justify-center md:justify-start gap-4 px-3 py-3 text-slate-500">
            <User className="w-5 h-5" />
            <span className="hidden md:block font-medium text-[10px] truncate">Creator: Rizkiprato</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0f1d] relative">
        {view === 'library' && (
          <SongLibrary 
            songs={songs} 
            onSelectSong={(s) => { setActiveSong(s); setView('song-view'); }} 
            onAddSong={() => { setActiveSong(null); setView('song-edit'); }}
            onEditSong={(s) => { setActiveSong(s); setView('song-edit'); }}
            onDeleteSong={handleDeleteSong}
            onImportLibrary={handleImportSongs}
          />
        )}

        {view === 'song-view' && activeSong && (
          <SongViewer 
            song={activeSong} 
            onBack={() => setView('library')} 
            onEdit={() => setView('song-edit')}
          />
        )}

        {view === 'song-edit' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950/20">
            <SongEditor 
              song={activeSong || undefined} 
              onSave={handleSaveSong} 
              onCancel={() => setView('library')} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
