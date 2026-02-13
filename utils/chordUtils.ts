
import { CHORD_ROOTS, FLAT_CHORD_ROOTS } from '../constants';

const getNoteIndex = (note: string): number => {
  let idx = CHORD_ROOTS.indexOf(note);
  if (idx === -1) idx = FLAT_CHORD_ROOTS.indexOf(note);
  if (idx === -1) {
    const mapping: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    idx = CHORD_ROOTS.indexOf(mapping[note] || '');
  }
  return idx;
};

export const transposeChord = (chord: string, semitones: number): string => {
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const root = match[1];
  const suffix = match[2];

  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return chord;

  const newIndex = (rootIndex + semitones + 12) % 12;
  return CHORD_ROOTS[newIndex] + suffix;
};

/**
 * Transposes text while preserving structure.
 * Matches:
 * 1. [C#m7] - ChordPro format
 * 2. Words that look like chords: C#m7, G/B, etc.
 */
export const transposeText = (text: string, semitones: number): string => {
  if (semitones === 0) return text;

  // Regex to find chords: starts with A-G, optional sharp/flat, 
  // optional quality (m, maj, etc), optional numbers, optional slash chord
  const chordRegex = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|M)?(?:\d+)?(?:(?:\/)([A-G][#b]?))?)\b/g;
  
  // First, handle bracketed chords [C]
  let processed = text.replace(/\[(.*?)\]/g, (match, p1) => {
    const parts = p1.split('/');
    const transposedParts = parts.map((part: string) => transposeChord(part.trim(), semitones));
    return `[${transposedParts.join('/')}]`;
  });

  // Then, handle naked chords (if the line looks like a chord line or the word is a chord)
  // We apply this to non-bracketed parts
  const lines = processed.split('\n');
  const transposedLines = lines.map(line => {
    // If line has brackets, we already transposed those parts
    if (line.includes('[')) return line;

    // Otherwise, try to find and transpose naked chords
    return line.replace(chordRegex, (match) => {
      // Split by slash for slash chords like G/B
      const parts = match.split('/');
      return parts.map(p => transposeChord(p, semitones)).join('/');
    });
  });

  return transposedLines.join('\n');
};
