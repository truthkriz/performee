
import React from 'react';
import { Song } from '../types';
import { Search, Music, Plus, MoreVertical, PlayCircle, Clock, Hash } from 'lucide-react';

interface SongLibraryProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onAddSong: () => void;
  onEditSong: (song: Song) => void;
}

const SongLibrary: React.FC<SongLibraryProps> = ({ songs, onSelectSong, onAddSong, onEditSong }) => {
  const [search, setSearch] = React.useState('');

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">My Songbook</h1>
          <p className="text-slate-400">Managing {songs.length} songs in your repertoire</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search title or artist..."
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-200 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={onAddSong}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-full font-bold shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Song
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSongs.map(song => (
          <div 
            key={song.id}
            className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden"
            onClick={() => onSelectSong(song)}
          >
            {/* Subtle background decoration */}
            <Music className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-700 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all" />
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-600/10 text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Music className="w-6 h-6" />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onEditSong(song); }}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{song.title}</h3>
            <p className="text-slate-400 mb-6 font-medium">{song.artist}</p>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                <Hash className="w-3 h-3" /> {song.key}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                <Clock className="w-3 h-3" /> {song.tempo}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                <PlayCircle className="w-3 h-3" /> {song.sections.length}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-wrap gap-2">
              {song.tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-700/30 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}

        {filteredSongs.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-500">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium">No songs found matching "{search}"</p>
            <button onClick={() => setSearch('')} className="mt-2 text-indigo-400 hover:underline">Clear search</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongLibrary;
