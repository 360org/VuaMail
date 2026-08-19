import React from 'react'
import {
  IconMail,
  IconCalendar,
  IconUsers,
  IconCheckSquare,
  IconBrain,
} from '../common/MailIcons'

export type AppRailTab = 'mail' | 'calendar' | 'people' | 'todo' | 'brain' | 'settings'

interface AppRailProps {
  activeTab: AppRailTab
  onTabChange: (tab: AppRailTab) => void
}

export const AppRail: React.FC<AppRailProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="vuamail-apprail">
      {/* 1. Mail (Inbox) */}
      <button
        type="button"
        className={`apprail-btn ${activeTab === 'mail' ? 'active' : ''}`}
        title="Hộp thư (Mail)"
        onClick={() => onTabChange('mail')}
      >
        <IconMail size={20} />
      </button>

      {/* 2. Calendar */}
      <button
        type="button"
        className={`apprail-btn ${activeTab === 'calendar' ? 'active' : ''}`}
        title="Lịch biểu (Calendar)"
        onClick={() => onTabChange('calendar')}
      >
        <IconCalendar size={20} />
      </button>

      {/* 3. People */}
      <button
        type="button"
        className={`apprail-btn ${activeTab === 'people' ? 'active' : ''}`}
        title="Danh bạ (People)"
        onClick={() => onTabChange('people')}
      >
        <IconUsers size={20} />
      </button>

      {/* 4. To-Do */}
      <button
        type="button"
        className={`apprail-btn ${activeTab === 'todo' ? 'active' : ''}`}
        title="Việc cần làm (To-Do)"
        onClick={() => onTabChange('todo')}
      >
        <IconCheckSquare size={20} />
      </button>

      {/* 5. AI Brain */}
      <button
        type="button"
        className={`apprail-btn ${activeTab === 'brain' ? 'active' : ''}`}
        title="Trí tuệ AI (Email Brain)"
        onClick={() => onTabChange('brain')}
      >
        <IconBrain size={20} />
      </button>
    </div>
  )
}

