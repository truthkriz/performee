
import React, { useState } from 'react';
import { Song, SongSection } from '../types';
import { Save, Plus, Trash2, X } from 'lucide-react';

interface SongEditorProps {
  song?: Song;
  onSave: (song: Song) => void;
  onCancel: () => void;
}

const SongEditor: React.FC<SongEditorProps> = ({ song, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Song>>(
    song || {
      title: '',
      artist: '',
      key: 'C',
      tempo: 120,
      timeSignature: '4/4',
      sections: [{ id: Math.random().toString(36).substr(2, 9), name: 'Verse 1', content: '' }],
      tags: []
    }
  );

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...(prev.sections || []), { id: Math.random().toString(36).substr(2, 9), name: 'New Section', content: '' }]
    }));
  };

  const updateSection = (id: string, field: keyof SongSection, value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections?.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeSection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections?.filter(s => s.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.artist) {
      onSave({
        ...formData,
        id: song?.id || Math.random().toString(36).substr(2, 9),
      } as Song);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{song ? 'Edit Song' : 'Add New Song'}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Artist</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.artist}
              onChange={e => setFormData({ ...formData, artist: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Default Key</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.key}
              onChange={e => setFormData({ ...formData, key: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Tempo (BPM)</label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.tempo}
              onChange={e => setFormData({ ...formData, tempo: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Time Sig</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.timeSignature}
              onChange={e => setFormData({ ...formData, timeSignature: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sections</h3>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-1 text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>
          
          {formData.sections?.map((section) => (
            <div key={section.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-3">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Section Name (e.g. Chorus)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:outline-none"
                  value={section.name}
                  onChange={e => updateSection(section.id, 'name', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                placeholder="Lyrics and [Chords]..."
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm font-mono h-32 focus:outline-none"
                value={section.content}
                onChange={e => updateSection(section.id, 'content', e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-md font-medium text-slate-400 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-2 rounded-md font-bold transition-all shadow-lg"
          >
            <Save className="w-5 h-5" />
            Save Song
          </button>
        </div>
      </form>
    </div>
  );
};

export default SongEditor;
