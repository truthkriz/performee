
export interface SongSection {
  id: string;
  name: string; // e.g., 'Verse 1', 'Chorus'
  content: string; // Markdown/ChordPro like format
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo: number;
  timeSignature: string;
  sections: SongSection[];
  tags: string[];
}

export interface Setlist {
  id: string;
  name: string;
  songIds: string[];
}

export type AppView = 'library' | 'song-view' | 'song-edit' | 'setlist';
