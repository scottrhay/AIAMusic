import React, { useState, useEffect } from 'react';
import { createSong, updateSong } from '../services/songs';
import './SongModal.css';

// Azure Speech voice options
const AZURE_VOICES = [
  { id: 'en-US-AndrewMultilingualNeural', name: 'Andrew Dragon HD Latest' },
  { id: 'en-US-AvaMultilingualNeural', name: 'Ava Multilingual' },
  { id: 'en-US-AndrewMultilingualNeural', name: 'Andrew Multilingual' },
  { id: 'en-US-PhoebeMultilingualNeural', name: 'Phoebe Multilingual' },
  { id: 'en-US-ChristopherMultilingualNeural', name: 'Christopher Multilingual' },
  { id: 'en-US-BrandonMultilingualNeural', name: 'Brandon Multilingual' },
  { id: 'en-US-DustinMultilingualNeural', name: 'Dustin Multilingual' },
  { id: 'en-US-SteffanMultilingualNeural', name: 'Steffan Multilingual' },
];

function SongModal({ song, styles, songs, onClose }) {
  const [formData, setFormData] = useState({
    specific_title: '',
    version: 'v1',
    specific_lyrics: '',
    voice_name: AZURE_VOICES[0].id,
    status: 'create',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (song) {
      setFormData({
        specific_title: song.specific_title || '',
        version: song.version || 'v1',
        specific_lyrics: song.specific_lyrics || '',
        voice_name: song.voice_name || AZURE_VOICES[0].id,
        status: song.status || 'create',
      });
    } else {
      // For new clips, check if a voice was selected from the Voices page
      const savedVoice = localStorage.getItem('selectedVoice');
      if (savedVoice) {
        try {
          const voice = JSON.parse(savedVoice);
          setFormData(prev => ({ ...prev, voice_name: voice.id }));
          // Clear the saved voice after using it
          localStorage.removeItem('selectedVoice');
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [song]);

  // Auto-calculate version when title changes (only for new clips)
  const calculateNextVersion = (title) => {
    if (!title || !songs || songs.length === 0) return 'v1';

    // Find all clips with the same title
    const sameTitleSongs = songs.filter(s =>
      s.specific_title && s.specific_title.toLowerCase() === title.toLowerCase()
    );

    if (sameTitleSongs.length === 0) return 'v1';

    // Get all version numbers
    const versionNumbers = sameTitleSongs
      .map(s => {
        const version = s.version || 'v1';
        const match = version.match(/v(\d+)/);
        return match ? parseInt(match[1]) : 1;
      })
      .filter(num => !isNaN(num));

    // Find the highest version number and increment
    const maxVersion = Math.max(...versionNumbers, 0);
    return `v${maxVersion + 1}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If title changes and this is a new clip (not editing), auto-calculate version
    if (name === 'specific_title' && (!song || !song.id)) {
      const nextVersion = calculateNextVersion(value);
      setFormData((prev) => ({ ...prev, [name]: value, version: nextVersion }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        // Map voice_name to style field for backend compatibility
        style_id: null,
      };

      if (song && song.id) {
        await updateSong(song.id, dataToSend);
      } else {
        await createSong(dataToSend);
      }

      onClose(true); // true = refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save voice clip');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{song && song.id ? 'Edit Voice Clip' : 'Add Voice Clip'}</h2>
          <button className="modal-close" onClick={() => onClose(false)}>
            ×
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 3 }}>
              <label>Clip Title</label>
              <input
                type="text"
                name="specific_title"
                value={formData.specific_title}
                onChange={handleChange}
                placeholder="Enter clip title"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Version</label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="v1"
                readOnly={!song || !song.id}
                style={{ backgroundColor: (!song || !song.id) ? '#f5f5f5' : 'white' }}
                title={(!song || !song.id) ? 'Version is auto-calculated based on title' : 'Edit version number'}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Speaker Text</label>
            <textarea
              name="specific_lyrics"
              value={formData.specific_lyrics}
              onChange={handleChange}
              rows="8"
              placeholder="Enter the text you want to synthesize to audio..."
            />
          </div>

          <div className="form-group">
            <label>Voice Name</label>
            <select name="voice_name" value={formData.voice_name} onChange={handleChange}>
              {AZURE_VOICES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onClose(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : song && song.id ? 'Update Clip' : 'Create Clip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SongModal;
