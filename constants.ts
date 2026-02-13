
import { Song } from './types';

export const INITIAL_SONGS: Song[] = [
  {
    id: '1',
    title: 'Hallelujah',
    artist: 'Leonard Cohen',
    key: 'C',
    tempo: 60,
    timeSignature: '6/8',
    sections: [
      {
        id: 's1',
        name: 'Verse 1',
        content: "[C]I've heard there was a [Am]secret chord\nThat [C]David played, and it [Am]pleased the Lord"
      },
      {
        id: 's2',
        name: 'Chorus',
        content: "Halle[F]lujah, Halle[Am]lujah\nHalle[F]lujah, Halle[C]lu[G]j[C]ah"
      }
    ],
    tags: ['Ballad', 'Classic']
  },
  {
    id: '2',
    title: 'Yellow',
    artist: 'Coldplay',
    key: 'B',
    tempo: 88,
    timeSignature: '4/4',
    sections: [
      {
        id: 's3',
        name: 'Intro',
        content: "[B] [Bmaj7] [F#] [E]"
      },
      {
        id: 's4',
        name: 'Verse 1',
        content: "Look at the [B]stars, look how they [F#]shine for you\nAnd everything [E]you do"
      }
    ],
    tags: ['Rock', 'Acoustic']
  }
];

export const CHORD_ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_CHORD_ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
