import { CHORD_ROOTS, FLAT_CHORD_ROOTS } from '../constants';

const getNoteIndex = (note: string): number => {
  let idx = CHORD_ROOTS.indexOf(note);
  if (idx !== -1) return idx;
  idx = FLAT_CHORD_ROOTS.indexOf(note);
  if (idx !== -1) return idx;

  const mapping: Record<string, number> = { 
    'C#': 1, 'Db': 1, 'D#': 3, 'Eb': 3, 'F#': 6, 'Gb': 6, 'G#': 8, 'Ab': 8, 'A#': 10, 'Bb': 10,
    'Cb': 11, 'B#': 0, 'E#': 5, 'Fb': 4
  };
  return mapping[note] ?? -1;
};

export const transposeChord = (chord: string, semitones: number): string => {
  // Regex presisi: Grup 1 adalah Root (A-G plus opsional # atau b), Grup 2 adalah sisa suffix (m7b5, etc)
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const root = match[1];
  const suffix = match[2];
  const rootIndex = getNoteIndex(root);
  
  if (rootIndex === -1) return chord;

  const newIndex = (rootIndex + semitones + 120) % 12;
  
  // Gunakan CHORD_ROOTS (sharps) sebagai standar output
  return CHORD_ROOTS[newIndex] + suffix;
};

export const transposeText = (text: string, semitones: number): string => {
  if (semitones === 0) return text;

  // Tangani chord di dalam kurung [C#m7b5]
  const bracketRegex = /\[([^\]]+)\]/g;
  let processed = text.replace(bracketRegex, (match, p1) => {
    // Tangani slash chords seperti [C/E]
    const parts = p1.split('/');
    const transposedParts = parts.map((part: string) => transposeChord(part.trim(), semitones));
    return `[${transposedParts.join('/')}]`;
  });

  return processed;
};
