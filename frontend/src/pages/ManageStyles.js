import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/Studio/TopBar';
import api from '../services/api';
import '../theme/theme.css';
import './ManageStyles.css';

// Azure Speech voice options - same as in SongModal
const AZURE_VOICES = [
  { id: 'en-US-AndrewMultilingualNeural', name: 'Andrew Dragon HD Latest', gender: 'Male' },
  { id: 'en-US-AvaMultilingualNeural', name: 'Ava Multilingual', gender: 'Female' },
  { id: 'en-US-AndrewMultilingualNeural', name: 'Andrew Multilingual', gender: 'Male' },
  { id: 'en-US-PhoebeMultilingualNeural', name: 'Phoebe Multilingual', gender: 'Female' },
  { id: 'en-US-ChristopherMultilingualNeural', name: 'Christopher Multilingual', gender: 'Male' },
  { id: 'en-US-BrandonMultilingualNeural', name: 'Brandon Multilingual', gender: 'Male' },
  { id: 'en-US-DustinMultilingualNeural', name: 'Dustin Multilingual', gender: 'Male' },
  { id: 'en-US-SteffanMultilingualNeural', name: 'Steffan Multilingual', gender: 'Male' },
];

function ManageStyles({ onLogout }) {
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState(AZURE_VOICES[0]);
  const [testText, setTestText] = useState('Hello! This is a test of the Azure Speech synthesis voice. How does it sound?');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState('');

  const handleTestVoice = async () => {
    if (!testText.trim()) {
      setError('Please enter some text to test');
      return;
    }

    setError('');
    setIsPlaying(true);

    try {
      const response = await api.post('/speech/synthesize', {
        text: testText,
        voice_name: selectedVoice.id,
      }, {
        responseType: 'blob'
      });

      // Create audio URL from blob
      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      // Clean up previous audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(url);

      // Play the audio
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setError('Failed to play audio');
      };
      audio.play();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to synthesize speech');
      setIsPlaying(false);
    }
  };

  const handleUseVoice = () => {
    // Store selected voice in localStorage for use in voice clip creation
    localStorage.setItem('selectedVoice', JSON.stringify(selectedVoice));
    navigate('/');
  };

  return (
    <div className="manage-styles">
      <TopBar
        onAddSong={() => navigate('/')}
        onManageStyles={null}
        onLogout={onLogout}
        primaryButtonText="Back to Clips"
        secondaryButtonText={null}
        primaryIconType="back"
        showSecondaryIcon={false}
      />

      <main className="manage-styles__content">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <span className="badge primary">Voice Selection</span>
            <span className="badge secondary">{AZURE_VOICES.length} voices</span>
          </div>
        </div>

        <p className="section-description">
          Select and test different Azure Speech voices. Click "Test Voice" to hear a sample, then use your preferred voice for creating voice clips.
        </p>

        <div className="styles-layout">
          <div className="styles-sidebar">
            <h3>Available Voices</h3>
            <div className="styles-list">
              {AZURE_VOICES.map((voice, index) => (
                <div
                  key={`${voice.id}-${index}`}
                  className={`style-item ${selectedVoice?.id === voice.id && selectedVoice?.name === voice.name ? 'active' : ''}`}
                  onClick={() => setSelectedVoice(voice)}
                >
                  <div className="style-item-name">{voice.name}</div>
                  <div className="style-item-meta">{voice.gender}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="style-details">
            {selectedVoice ? (
              <>
                <div className="details-header">
                  <h2>{selectedVoice.name}</h2>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={handleTestVoice}
                      disabled={isPlaying}
                    >
                      {isPlaying ? 'Playing...' : 'Test Voice'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleUseVoice}
                    >
                      Use This Voice
                    </button>
                  </div>
                </div>

                <div className="details-content">
                  <div className="detail-section">
                    <h4>Voice Details</h4>
                    <p><strong>Voice ID:</strong> {selectedVoice.id}</p>
                    <p><strong>Gender:</strong> {selectedVoice.gender}</p>
                  </div>

                  <div className="detail-section">
                    <h4>Test Text</h4>
                    <textarea
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      rows="4"
                      placeholder="Enter text to test the voice..."
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-2)' }}>
                      Enter custom text above and click "Test Voice" to hear how this voice sounds.
                    </p>
                  </div>

                  {error && (
                    <div className="alert alert-error" style={{ marginTop: 'var(--spacing-3)' }}>
                      {error}
                    </div>
                  )}

                  {audioUrl && !isPlaying && (
                    <div className="detail-section" style={{ marginTop: 'var(--spacing-3)' }}>
                      <h4>Last Test Audio</h4>
                      <audio controls src={audioUrl} style={{ width: '100%' }} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-selection">
                <p>Select a voice to view details and test</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ManageStyles;
