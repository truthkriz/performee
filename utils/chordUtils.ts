
import { CHORD_ROOTS, FLAT_CHORD_ROOTS } from '../constants';

/**
 * Returns the chromatic index (0-11) for a given note name.
 */
const getNoteIndex = (note: string): number => {
  // Try exact matches in Sharps
  let idx = CHORD_ROOTS.indexOf(note);
  if (idx !== -1) return idx;

  // Try exact matches in Flats
  idx = FLAT_CHORD_ROOTS.indexOf(note);
  if (idx !== -1) return idx;

  // Manual fallback for common aliases/mistakes
  const mapping: Record<string, number> = { 
    'C#': 1, 'Db': 1, 
    'D#': 3, 'Eb': 3, 
    'F#': 6, 'Gb': 6, 
    'G#': 8, 'Ab': 8, 
    'A#': 10, 'Bb': 10,
    'Cb': 11, 'B#': 0, // Edge cases
    'E#': 5, 'Fb': 4
  };
  
  return mapping[note] ?? -1;
};

/**
 * Transposes a single chord string (e.g., "D#m7", "G/B").
 */
export const transposeChord = (chord: string, semitones: number): string => {
  // Match the root note (A-G plus optional # or b) and the rest (suffix)
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const root = match[1];
  const suffix = match[2];

  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return chord;

  // Calculate new index using modulo 12
  const newIndex = (rootIndex + semitones + 120) % 12; // +120 to handle large negative transpositions safely
  
  // Return the new chord root + original suffix
  // Use CHORD_ROOTS (Sharps) as the default output format
  return CHORD_ROOTS[newIndex] + suffix;
};

/**
 * Transposes a block of text containing lyrics and chords.
 */
export const transposeText = (text: string, semitones: number): string => {
  if (semitones === 0) return text;

  // Improved Regex:
  // 1. Matches text inside brackets [D#m7]
  // 2. Matches standalone chords at start/end or surrounded by spaces/punctuation
  // This avoids splitting D# into D and #
  const bracketRegex = /\[([^\]]+)\]/g;
  
  // First, handle bracketed content
  let processed = text.replace(bracketRegex, (match, p1) => {
    const parts = p1.split('/');
    const transposedParts = parts.map((part: string) => transposeChord(part.trim(), semitones));
    return `[${transposedParts.join('/')}]`;
  });

  // Second, handle "naked" chords in lines that don't use brackets
  // We use a regex that looks for standard chord patterns but respects boundaries
  // Note: \b is dangerous for #, so we use space/start/end delimiters
  const lines = processed.split('\n');
  const transposedLines = lines.map(line => {
    // If the line already used brackets, we assume it's ChordPro and skip naked parsing
    if (line.includes('[')) return line;

    // Regex for words that look like chords: 
    // root (A-G plus #/b), optional quality (m, maj, etc), optional number, optional slash
    // We split the line by whitespace, transpose valid chords, and join back
    return line.split(/(\s+)/).map(segment => {
      // Check if this segment looks exactly like a chord
      const isPotentialChord = /^[A-G][#b]?(?:m|maj|min|aug|dim|sus|add|M)?\d*(?:\/[A-G][#b]?)?$/.test(segment);
      if (isPotentialChord) {
        const parts = segment.split('/');
        return parts.map(p => transposeChord(p, semitones)).join('/');
      }
      return segment;
    }).join('');
  });

  return transposedLines.join('\n');
};
