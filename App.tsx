
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

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chordflow_songs');
    if (saved) {
      setSongs(JSON.parse(saved));
    } else {
      setSongs(INITIAL_SONGS);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (songs.length > 0) {
      localStorage.setItem('chordflow_songs', JSON.stringify(songs));
    }
  }, [songs]);

  const handleSaveSong = (newSong: Song) => {
    setSongs(prev => {
      const exists = prev.find(s => s.id === newSong.id);
      if (exists) {
        return prev.map(s => s.id === newSong.id ? newSong : s);
      }
      return [newSong, ...prev];
    });
    setView('library');
  };

  const handleSelectSong = (song: Song) => {
    setActiveSong(song);
    setView('song-view');
  };

  const handleEditSong = (song: Song) => {
    setActiveSong(song);
    setView('song-edit');
  };

  const handleAddNew = () => {
    setActiveSong(null);
    setView('song-edit');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col py-6">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Music className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="hidden md:block text-xl font-black tracking-tight text-white">PERFORMEE</span>
        </div>

        <div className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setView('library')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === 'library' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="hidden md:block font-semibold">Library</span>
          </button>
          
          <button 
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-all opacity-50 cursor-not-allowed"
            title="Coming Soon"
          >
            <ListMusic className="w-5 h-5" />
            <span className="hidden md:block font-semibold">Setlists</span>
          </button>
        </div>

        <div className="px-4 pt-6 border-t border-slate-800 space-y-2">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-all opacity-50 cursor-not-allowed">
            <User className="w-5 h-5" />
            <span className="hidden md:block font-semibold">Profile</span>
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-all opacity-50 cursor-not-allowed">
            <Info className="w-5 h-5" />
            <span className="hidden md:block font-semibold">About</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 relative">
        {view === 'library' && (
          <SongLibrary 
            songs={songs} 
            onSelectSong={handleSelectSong} 
            onAddSong={handleAddNew}
            onEditSong={handleEditSong}
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
          <div className="p-8">
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
