import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSongs, getSongStats, deleteSong } from '../services/songs';
import { getStyles } from '../services/styles';
import TopBar from '../components/Studio/TopBar';
import StudioStats from '../components/Studio/StudioStats';
import ControlBarPremium from '../components/Studio/ControlBarPremium';
import TrackGrid from '../components/Studio/TrackGrid';
import TrackCard from '../components/Studio/TrackCard';
import SongModal from '../components/SongModal';
import SongViewModal from '../components/SongViewModal';
import '../theme/theme.css';
import './HomePremium.css';

function HomePremium({ onLogout }) {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [styles, setStyles] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingSong, setViewingSong] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    style_id: '',
    vocal_gender: 'all',
    search: '',
    all_users: false,
    min_stars: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [songsData, stylesData, statsData] = await Promise.all([
        getSongs(filters),
        getStyles(),
        getSongStats(filters.all_users),
      ]);

      setSongs(songsData.songs);
      setStyles(stylesData.styles);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Auto-refresh when there are songs in submitted status or completed without audio
  useEffect(() => {
    const needsRefresh = songs.some(song =>
      song.status === 'submitted' ||
      (song.status === 'completed' && !song.download_url_1 && !song.download_url_2)
    );

    if (needsRefresh) {
      const intervalId = setInterval(() => {
        loadData();
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songs]);

  // Client-side filtering for star rating
  const filteredSongs = useMemo(() => {
    if (!filters.min_stars || filters.min_stars === 0) {
      return songs;
    }
    return songs.filter(song => (song.star_rating || 0) >= filters.min_stars);
  }, [songs, filters.min_stars]);

  const handleAddSong = () => {
    setEditingSong(null);
    setShowModal(true);
  };

  const handleViewSong = (song) => {
    setViewingSong(song);
    setShowViewModal(true);

    // Set as playing if it has audio
    if (song.status === 'completed' && (song.download_url_1 || song.download_url_2)) {
      setPlayingSongId(song.id);
    }
  };

  const handleDeleteSong = async (songId) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSong(songId);

        // If the deleted song was playing, stop playback
        if (playingSongId === songId) {
          setPlayingSongId(null);
        }

        loadData();
      } catch (error) {
        console.error('Error deleting song:', error);
        alert('Failed to delete song');
      }
    }
  };

  const handleDuplicateSong = (song) => {
    // Close view modal if open
    setShowViewModal(false);
    setViewingSong(null);

    // Calculate next version number
    const currentVersion = song.version || 'v1';
    const versionNumber = parseInt(currentVersion.replace('v', '')) || 1;
    const nextVersion = `v${versionNumber + 1}`;

    // Create a copy of the song without id, status, timestamps, and URLs
    const duplicatedSong = {
      specific_title: song.specific_title,
      version: nextVersion,
      specific_lyrics: song.specific_lyrics,
      prompt_to_generate: song.prompt_to_generate,
      style_id: song.style?.id || song.style_id,
      vocal_gender: song.vocal_gender,
    };

    // Open the modal in "create" mode with the duplicated data
    setEditingSong(duplicatedSong);
    setShowModal(true);
  };

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false);
    setEditingSong(null);
    if (shouldRefresh) {
      loadData();
    }
  };

  const handleViewModalClose = () => {
    setShowViewModal(false);
    setViewingSong(null);
    setPlayingSongId(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      style_id: '',
      vocal_gender: 'all',
      search: '',
      all_users: false,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return filters.search || filters.style_id || filters.vocal_gender !== 'all' || filters.all_users;
  }, [filters]);

  return (
    <div className="home-premium">
      <TopBar
        onAddSong={handleAddSong}
        onManageStyles={() => navigate('/styles')}
        onLogout={onLogout}
      />

      <main className="home-premium__content">
        <div className="home-premium__container">
          {/* Stats positioned with grid */}
          <div className="home-premium__header">
            <StudioStats stats={stats} />
          </div>

          <ControlBarPremium
            filters={filters}
            onFilterChange={handleFilterChange}
            styles={styles}
            onClearFilters={handleClearFilters}
          />

          <TrackGrid
            songs={filteredSongs}
            loading={loading}
            onAddSong={handleAddSong}
            hasFilters={hasActiveFilters}
          >
            {filteredSongs.map((song) => (
              <TrackCard
                key={song.id}
                song={song}
                onView={handleViewSong}
                onDelete={handleDeleteSong}
                onDuplicate={handleDuplicateSong}
                isPlaying={playingSongId === song.id}
              />
            ))}
          </TrackGrid>
        </div>
      </main>

      {showModal && (
        <SongModal
          song={editingSong}
          styles={styles}
          songs={songs}
          onClose={handleModalClose}
        />
      )}

      {showViewModal && (
        <SongViewModal
          song={viewingSong}
          onClose={handleViewModalClose}
          onDuplicate={handleDuplicateSong}
        />
      )}
    </div>
  );
}

export default HomePremium;
