import React, { useState, useEffect } from 'react';
import { createSong, updateSong } from '../services/songs';
import './SongModal.css';

function SongModal({ song, styles, songs, onClose }) {
  const [formData, setFormData] = useState({
    specific_title: '',
    version: 'v1',
    specific_lyrics: '',
    prompt_to_generate: '',
    style_id: '',
    vocal_gender: 'male',
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
        prompt_to_generate: song.prompt_to_generate || '',
        style_id: song.style_id || '',
        vocal_gender: song.vocal_gender || 'male',
        status: song.status || 'create',
      });
    }
  }, [song]);

  // Auto-calculate version when title changes (only for new songs)
  const calculateNextVersion = (title) => {
    if (!title || !songs || songs.length === 0) return 'v1';

    // Find all songs with the same title
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

    // If title changes and this is a new song (not editing), auto-calculate version
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
      // Convert empty string to null for style_id
      const dataToSend = {
        ...formData,
        style_id: formData.style_id ? parseInt(formData.style_id) : null,
      };

      if (song && song.id) {
        await updateSong(song.id, dataToSend);
      } else {
        await createSong(dataToSend);
      }

      onClose(true); // true = refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save song');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{song && song.id ? 'Edit Song' : 'Add New Song'}</h2>
          <button className="modal-close" onClick={() => onClose(false)}>
            ×
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 3 }}>
              <label>Song Title</label>
              <input
                type="text"
                name="specific_title"
                value={formData.specific_title}
                onChange={handleChange}
                placeholder="Enter song title"
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
            <label>Lyrics (max 5000 characters)</label>
            <textarea
              name="specific_lyrics"
              value={formData.specific_lyrics}
              onChange={handleChange}
              rows="6"
              maxLength="5000"
              placeholder="Enter song lyrics..."
            />
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
              {formData.specific_lyrics.length}/5000 characters
            </div>
          </div>

          <div className="form-group">
            <label>Prompt to Generate Lyrics (Optional)</label>
            <textarea
              name="prompt_to_generate"
              value={formData.prompt_to_generate}
              onChange={handleChange}
              rows="3"
              placeholder="Custom prompt for song generation..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Style</label>
              <select name="style_id" value={formData.style_id} onChange={handleChange}>
                <option value="">Select a style</option>
                {styles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Vocal Gender</label>
              <select
                name="vocal_gender"
                value={formData.vocal_gender}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
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
              {saving ? 'Saving...' : song && song.id ? 'Update Song' : 'Create Song'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SongModal;
