import React, { useState, useEffect, useRef } from 'react';
import './TrackCard.css';
import StarRating from '../StarRating';
import { updateSongRating, updateSong } from '../../services/songs';

function TrackCard({ song, onView, onDelete, onDuplicate, onRatingChange, isPlaying }) {
  const [showMenu, setShowMenu] = useState(false);
  const [rating, setRating] = useState(song.star_rating || 0);
  const [downloadedUrl1, setDownloadedUrl1] = useState(song.downloaded_url_1 || false);
  const [downloadedUrl2, setDownloadedUrl2] = useState(song.downloaded_url_2 || false);
  const autoDownloadedRef = useRef({
    url1: song.downloaded_url_1 || false,
    url2: song.downloaded_url_2 || false
  });

  const handleDownload = async (url, filename, trackNumber) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);

      // Mark as downloaded in database
      try {
        const updateData = trackNumber === 1
          ? { downloaded_url_1: true }
          : { downloaded_url_2: true };
        await updateSong(song.id, updateData);

        // Update local state and ref
        if (trackNumber === 1) {
          setDownloadedUrl1(true);
          autoDownloadedRef.current.url1 = true;
        } else {
          setDownloadedUrl2(true);
          autoDownloadedRef.current.url2 = true;
        }
      } catch (error) {
        console.error('Failed to mark as downloaded:', error);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(url, '_blank');
    }
  };

  // Auto-download when URLs become available
  useEffect(() => {
    const autoDownloadFile = async (url, filename, trackNumber, alreadyDownloaded) => {
      if (url && !alreadyDownloaded) {
        console.log(`Auto-downloading Track ${trackNumber} for: ${song.specific_title}`);
        await handleDownload(url, filename, trackNumber);
      }
    };

    // Auto-download track 1 if available and not yet downloaded
    if (song.download_url_1 && !song.downloaded_url_1 && !autoDownloadedRef.current.url1) {
      const filename = `${(song.specific_title || 'song').replace(/[/\\?%*:|"<>]/g, '-')}_1_${song.version || 'v1'}.mp3`;
      autoDownloadFile(song.download_url_1, filename, 1, song.downloaded_url_1);
    }

    // Auto-download track 2 if available and not yet downloaded
    if (song.download_url_2 && !song.downloaded_url_2 && !autoDownloadedRef.current.url2) {
      const filename = `${(song.specific_title || 'song').replace(/[/\\?%*:|"<>]/g, '-')}_2_${song.version || 'v1'}.mp3`;
      autoDownloadFile(song.download_url_2, filename, 2, song.downloaded_url_2);
    }
  }, [song.download_url_1, song.download_url_2, song.downloaded_url_1, song.downloaded_url_2, song.specific_title, song.version, song.id]);

  const truncateText = (text, maxLength = 300) => {
    if (!text) return 'No lyrics provided';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const hasAudio = song.status === 'completed' && (song.download_url_1 || song.download_url_2);

  const getStatusInfo = (status) => {
    // If status is 'completed' but no audio URLs yet, show "Generating"
    if (status === 'completed' && !hasAudio) {
      return { label: 'Generating', className: 'status-generating' };
    }

    const statuses = {
      'completed': { label: 'Ready', className: 'status-ready' },
      'submitted': { label: 'Generating', className: 'status-generating' },
      'create': { label: 'Draft', className: 'status-draft' },
      'failed': { label: 'Failed', className: 'status-failed' },
    };
    return statuses[status] || { label: 'Unknown', className: 'status-unknown' };
  };

  const statusInfo = getStatusInfo(song.status);

  const handleCardClick = () => {
    onView(song);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
    setShowMenu(false);
  };

  const handleRatingChange = async (newRating) => {
    try {
      setRating(newRating);
      await updateSongRating(song.id, newRating);
      if (onRatingChange) {
        onRatingChange(song.id, newRating);
      }
    } catch (error) {
      console.error('Failed to update rating:', error);
      // Revert on error
      setRating(song.star_rating || 0);
    }
  };

  return (
    <div
      className={`track-card ${isPlaying ? 'track-card--playing' : ''}`}
      onClick={handleCardClick}
    >
      {/* Now Playing Indicator */}
      {isPlaying && (
        <div className="track-card__now-playing">
          <svg className="equalizer-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="4" width="4" height="16" fill="currentColor" className="bar bar-1"/>
            <rect x="14" y="8" width="4" height="12" fill="currentColor" className="bar bar-2"/>
            <rect x="22" y="12" width="4" height="8" fill="currentColor" className="bar bar-3"/>
          </svg>
          <span>Now Playing</span>
        </div>
      )}

      {/* Header */}
      <div className="track-card__header">
        <div className="track-card__left">
          <div className="track-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18V5L21 3V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>

          <div className="track-info">
            <h3 className="track-title">
              <span className="track-title-text">{song.specific_title || 'Untitled Song'}</span>
              {song.version && <span className="track-version">{song.version}</span>}
            </h3>
            <div className="track-meta-compact">
              {song.creator && <span>{song.creator}</span>}
              {song.creator && song.style_name && <span className="meta-dot">•</span>}
              {song.style_name && <span>{song.style_name}</span>}
            </div>
          </div>
        </div>

        <div className="track-card__right">
          <div className="track-card__rating" onClick={(e) => e.stopPropagation()}>
            <StarRating
              rating={rating}
              onRatingChange={handleRatingChange}
              size="small"
            />
          </div>

          {/* Only show status if not ready */}
          {song.status !== 'completed' || !hasAudio ? (
            <span className={`track-status ${statusInfo.className}`}>
              {statusInfo.label}
              {(song.status === 'submitted' || (song.status === 'completed' && !hasAudio)) && (
                <span className="status-pulse"></span>
              )}
            </span>
          ) : null}

          <div className="track-actions">
            {hasAudio && (
              <button
                className="action-btn action-btn--play"
                onClick={(e) => handleActionClick(e, () => onView(song))}
                aria-label="Play song"
                title="Play"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              </button>
            )}

            <div className="menu-container">
              <button
                className="action-btn action-btn--menu"
                onClick={handleMenuClick}
                aria-label="More actions"
                aria-expanded={showMenu}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="5" r="2" fill="currentColor"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  <circle cx="12" cy="19" r="2" fill="currentColor"/>
                </svg>
              </button>

              {showMenu && (
                <div className="menu-dropdown">
                  <button
                    className="menu-item"
                    onClick={(e) => handleActionClick(e, () => onDuplicate(song))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Duplicate</span>
                  </button>

                  <button
                    className="menu-item menu-item--danger"
                    onClick={(e) => handleActionClick(e, () => onDelete(song.id))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Preview */}
      <p className="track-lyrics">
        {truncateText(song.specific_lyrics)}
      </p>

      {/* Audio Players */}
      {hasAudio && (
        <div className="track-audio-section" onClick={(e) => e.stopPropagation()}>
          {song.download_url_1 && (
            <div className="track-audio-player">
              <span className="audio-label">Track 1</span>
              <audio
                controls
                className="audio-player-compact"
                controlsList="nodownload"
              >
                <source src={song.download_url_1} type="audio/mpeg" />
              </audio>
              <button
                className="download-btn-compact download-btn-primary"
                title="Download Track 1 - Audio files expire after 15 days!"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(
                    song.download_url_1,
                    `${(song.specific_title || 'song').replace(/[/\\?%*:|"<>]/g, '-')}_1_${song.version || 'v1'}.mp3`,
                    1
                  );
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
          {song.download_url_2 && (
            <div className="track-audio-player">
              <span className="audio-label">Track 2</span>
              <audio
                controls
                className="audio-player-compact"
                controlsList="nodownload"
              >
                <source src={song.download_url_2} type="audio/mpeg" />
              </audio>
              <button
                className="download-btn-compact download-btn-primary"
                title="Download Track 2 - Audio files expire after 15 days!"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(
                    song.download_url_2,
                    `${(song.specific_title || 'song').replace(/[/\\?%*:|"<>]/g, '-')}_2_${song.version || 'v1'}.mp3`,
                    2
                  );
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* Only show expiration reminder if not all files are downloaded */}
          {(!downloadedUrl1 || !downloadedUrl2) && (
            <div className="download-reminder">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 6V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="10" cy="14" r="1" fill="currentColor"/>
              </svg>
              <span>Audio files expire after 15 days - download to save!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TrackCard;
