import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStyles, deleteStyle } from '../services/styles';
import TopBar from '../components/Studio/TopBar';
import StyleModal from '../components/StyleModal';
import '../theme/theme.css';
import './ManageStyles.css';

function ManageStyles({ onLogout }) {
  const navigate = useNavigate();
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStyle, setEditingStyle] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' or 'mine'
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadStyles();
    // Get current user ID from localStorage - use the correct key 'aiaspeech_user'
    const user = JSON.parse(localStorage.getItem('aiaspeech_user') || '{}');
    console.log('Current user from localStorage:', user);
    console.log('User ID:', user.id);
    setCurrentUserId(user.id);

    // If no user ID, default to showing all styles
    if (!user.id) {
      setFilter('all');
    }
  }, []);

  const loadStyles = async () => {
    try {
      setLoading(true);
      const data = await getStyles();
      setStyles(data.styles);
      if (data.styles.length > 0 && !selectedStyle) {
        setSelectedStyle(data.styles[0]);
      }
    } catch (error) {
      console.error('Error loading styles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStyle = () => {
    setEditingStyle(null);
    setShowModal(true);
  };

  const handleEditStyle = (style) => {
    setEditingStyle(style);
    setShowModal(true);
  };

  const handleDuplicateStyle = (style) => {
    // Create a new style object without id and with modified name
    const duplicatedStyle = {
      name: `${style.name} (Copy)`,
      style_prompt: style.style_prompt
    };

    setEditingStyle(duplicatedStyle);
    setShowModal(true);
  };

  const handleDeleteStyle = async (styleId) => {
    if (window.confirm('Are you sure you want to delete this style?')) {
      try {
        await deleteStyle(styleId);
        if (selectedStyle?.id === styleId) {
          setSelectedStyle(null);
        }
        loadStyles();
      } catch (error) {
        console.error('Error deleting style:', error);
        alert(error.response?.data?.error || 'Failed to delete style');
      }
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false);
    setEditingStyle(null);
    if (shouldRefresh) {
      loadStyles();
    }
  };

  // Filter styles based on filter state
  const filteredStyles = filter === 'mine'
    ? styles.filter(style => {
        const match = Number(style.created_by_id) === Number(currentUserId);
        console.log(`Checking style ${style.name}: created_by_id=${style.created_by_id}, currentUserId=${currentUserId}, match=${match}`);
        return match;
      })
    : styles;

  const canEditStyle = (style) => {
    if (!currentUserId || !style.created_by_id) return false;
    return Number(style.created_by_id) === Number(currentUserId);
  };

  return (
    <div className="manage-styles">
      <TopBar
        onAddSong={() => navigate('/')}
        onManageStyles={handleAddStyle}
        onLogout={onLogout}
        primaryButtonText="Back to Songs"
        secondaryButtonText="New Style"
        primaryIconType="back"
        showSecondaryIcon={true}
        secondaryIconType="plus"
      />

      <main className="manage-styles__content">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <span className="badge primary">Style Management</span>
            <span className="badge secondary">{filteredStyles.length} styles</span>
          </div>

          <div className="filter-toggle">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Styles
            </button>
            <button
              className={`filter-btn ${filter === 'mine' ? 'active' : ''}`}
              onClick={() => setFilter('mine')}
            >
              My Styles
            </button>
          </div>
        </div>

        <p className="section-description">
          Manage your music styles. Create, edit, and organize style templates for song generation.
        </p>

        {loading ? (
          <div className="loading">Loading styles...</div>
        ) : filteredStyles.length === 0 ? (
          <div className="empty-state">
            <p>No styles found. Create your first style to get started!</p>
            <button className="btn btn-primary" onClick={handleAddStyle}>
              Add New Style
            </button>
          </div>
        ) : (
          <div className="styles-layout">
            <div className="styles-sidebar">
              <h3>Styles</h3>
              <div className="styles-list">
                {filteredStyles.map((style) => (
                  <div
                    key={style.id}
                    className={`style-item ${selectedStyle?.id === style.id ? 'active' : ''}`}
                    onClick={() => setSelectedStyle(style)}
                  >
                    <div className="style-item-name">{style.name}</div>
                    <div className="style-item-actions">
                      {canEditStyle(style) && (
                        <>
                          <button
                            className="icon-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStyle(style);
                            }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="icon-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateStyle(style);
                            }}
                            title="Duplicate"
                          >
                            📋
                          </button>
                          <button
                            className="icon-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStyle(style.id);
                            }}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="style-details">
              {selectedStyle ? (
                <>
                  <div className="details-header">
                    <h2>{selectedStyle.name}</h2>
                    <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleDuplicateStyle(selectedStyle)}
                      >
                        Duplicate
                      </button>
                      {canEditStyle(selectedStyle) && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEditStyle(selectedStyle)}
                        >
                          Edit Style
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="details-content">
                    {selectedStyle.style_prompt && (
                      <div className="detail-section">
                        <h4>Style Prompt</h4>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{selectedStyle.style_prompt}</p>
                      </div>
                    )}

                    {selectedStyle.created_by && (
                      <div className="detail-section meta">
                        <small>Created by: {selectedStyle.created_by}</small>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <p>Select a style to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <StyleModal style={editingStyle} onClose={handleModalClose} />
      )}
    </div>
  );
}

export default ManageStyles;
