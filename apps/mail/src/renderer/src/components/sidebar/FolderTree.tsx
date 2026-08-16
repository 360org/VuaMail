import React, { useState } from 'react'
import type { EmailAccount, MailFolder } from '../../../../shared/types'

interface FolderTreeProps {
  accounts: EmailAccount[]
  activeAccountId: string
  onSelectAccount: (accountId: string) => void
  folders: MailFolder[]
  activeFolderId: string
  onSelectFolder: (folderId: string, accountId: string) => void
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  accounts,
  activeAccountId,
  onSelectAccount,
  folders,
  activeFolderId,
  onSelectFolder,
}) => {
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({
    acc_primary: true,
    acc_secondary: true,
  })

  const toggleExpand = (accId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedAccounts((prev) => ({ ...prev, [accId]: !prev[accId] }))
  }

  const getFolderIcon = (kind: string) => {
    switch (kind) {
      case 'inbox':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        )
      case 'drafts':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        )
      case 'sent':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )
      case 'archive':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        )
      case 'trash':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        )
      default:
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        )
    }
  }

  const getFolderLabel = (f: MailFolder) => {
    switch (f.kind) {
      case 'inbox':
        return 'Hộp thư đến'
      case 'drafts':
        return 'Thư nháp'
      case 'sent':
        return 'Thư đã gửi'
      case 'archive':
        return 'Kho lưu trữ'
      case 'trash':
        return 'Thùng rác'
      default:
        return f.name
    }
  }

  // Favorite quick links: only show favorites for current active account to avoid duplicates
  const favoriteFolders = folders.filter((f) => f.accountId === activeAccountId && f.isFavorite)

  return (
    <div className="vuamail-folders">
      {/* Favorites Section */}
      {favoriteFolders.length > 0 && (
        <div className="folder-section">
          <div className="folder-group-title">MỤC YÊU THÍCH</div>
          {favoriteFolders.map((f) => {
            const isActive = activeFolderId === f.id && activeAccountId === f.accountId
            return (
              <div
                key={`fav_${f.id}`}
                className={`folder-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectAccount(f.accountId)
                  onSelectFolder(f.id, f.accountId)
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getFolderIcon(f.kind)}
                  <span>{getFolderLabel(f)}</span>
                </div>
                {f.unreadCount > 0 && <span className="folder-unread">{f.unreadCount}</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* Account Trees */}
      {accounts.map((acc) => {
        const isExpanded = expandedAccounts[acc.id] ?? true
        const accFolders = folders.filter((f) => f.accountId === acc.id)

        return (
          <div key={acc.id} className="folder-account-group" style={{ marginTop: '8px' }}>
            <div
              className={`folder-account-header ${activeAccountId === acc.id ? 'current-acc' : ''}`}
              onClick={() => onSelectAccount(acc.id)}
            >
              <button
                className="expand-btn"
                onClick={(e) => toggleExpand(acc.id, e)}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
              <div className="account-title-box">
                <span className="account-name">{acc.name}</span>
                <span className="account-email">{acc.email}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="account-folders-list">
                {accFolders.map((f) => {
                  const isActive = activeFolderId === f.id && activeAccountId === acc.id
                  return (
                    <div
                      key={f.id}
                      className={`folder-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        onSelectAccount(acc.id)
                        onSelectFolder(f.id, acc.id)
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getFolderIcon(f.kind)}
                        <span>{getFolderLabel(f)}</span>
                      </div>
                      {f.unreadCount > 0 && <span className="folder-unread">{f.unreadCount}</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
