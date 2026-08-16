import React from 'react'

export type AppRailTab = 'brain' | 'mail' | 'calendar' | 'people' | 'todo'

interface AppRailProps {
  activeTab: AppRailTab
  onTabChange: (tab: AppRailTab) => void
}

export const AppRail: React.FC<AppRailProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="vuamail-apprail">
      {/* Profile / Avatar top */}
      <div
        className="apprail-avatar-box"
        onClick={() => onTabChange('brain')}
        style={{ cursor: 'pointer' }}
        title="Hồ sơ cá nhân & Cài đặt tài khoản"
      >
        <div className={`apprail-avatar ${activeTab === 'brain' ? 'active-avatar' : ''}`}>
          LC
        </div>
      </div>

      {/* 1. Email Brain & Profile */}
      <button
        className={`apprail-btn ${activeTab === 'brain' ? 'active' : ''}`}
        title="Hồ sơ, Brain & Cài đặt tài khoản"
        onClick={() => onTabChange('brain')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 0 0 18" />
          <path d="M12 7a5 5 0 0 0 0 10" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </button>

      {/* 2. Mail (Inbox) */}
      <button
        className={`apprail-btn ${activeTab === 'mail' ? 'active' : ''}`}
        title="Mail"
        onClick={() => onTabChange('mail')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </button>

      {/* 3. Calendar */}
      <button
        className={`apprail-btn ${activeTab === 'calendar' ? 'active' : ''}`}
        title="Calendar"
        onClick={() => onTabChange('calendar')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {/* 4. People */}
      <button
        className={`apprail-btn ${activeTab === 'people' ? 'active' : ''}`}
        title="People"
        onClick={() => onTabChange('people')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </button>

      {/* 5. To-Do */}
      <button
        className={`apprail-btn ${activeTab === 'todo' ? 'active' : ''}`}
        title="To Do"
        onClick={() => onTabChange('todo')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </button>
    </div>
  )
}
