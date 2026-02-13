
import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseSongWithAI = async (input: string): Promise<Partial<Song>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following song text and convert it into a structured format. Identify the title, artist, key, tempo, and divide it into sections (Verse, Chorus, Bridge, etc.). 
    Format chords inside brackets like [G].
    
    Song Text:
    ${input}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          key: { type: Type.STRING },
          tempo: { type: Type.NUMBER },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["name", "content"]
            }
          }
        },
        required: ["title", "artist", "sections"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {};
  }
};

export const suggestArrangement = async (song: Song): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a powerful live performance arrangement for the song "${song.title}" by "${song.artist}". 
    The current sections are: ${song.sections.map(s => s.name).join(', ')}.
    Return an ordered list of section names (e.g., Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus, Outro).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return song.sections.map(s => s.name);
  }
};
