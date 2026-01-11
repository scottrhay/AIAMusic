import React from 'react';
import './EmptyState.css';

function EmptyState({ onAddSong, hasFilters }) {
  if (hasFilters) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon empty-state__icon--search">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="empty-state__title">No voice clips match your filters</h3>
        <p className="empty-state__description">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 19V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="empty-state__title">Create your first voice clip</h3>
      <p className="empty-state__description">
        Get started by creating a new voice clip. Add your text, choose a voice, and let's start creating!
      </p>
      <button className="empty-state__cta" onClick={onAddSong}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Create New Voice Clip</span>
      </button>
    </div>
  );
}

export default EmptyState;
