import React from 'react'
import type { EmailAccount, MailFolder } from '../../../../shared/types'

interface FolderTreeProps {
  accounts: EmailAccount[]
  activeAccountId: string
  onSelectAccount: (accountId: string) => void
  folders: MailFolder[]
  activeFolderId: string
  onSelectFolder: (folderId: string) => void
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  accounts,
  activeAccountId,
  onSelectAccount,
  folders,
  activeFolderId,
  onSelectFolder,
}) => {
  const favorites = folders.filter((f) => f.isFavorite)
  const allFolders = folders
  const currentAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0]

  return (
    <div className="vuamail-folders">
      {/* Account Switcher Header */}
      {accounts.length > 1 && (
        <div className="account-switcher-box" style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
            Tài khoản (Accounts)
          </div>
          <select
            value={activeAccountId}
            onChange={(e) => onSelectAccount(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: 500,
            }}
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {favorites.length > 0 && (
        <>
          <div className="folder-group-title">Favorites</div>
          {favorites.map((f) => (
            <div
              key={`fav_${f.id}`}
              className={`folder-item ${activeFolderId === f.id ? 'active' : ''}`}
              onClick={() => onSelectFolder(f.id)}
            >
              <span>{f.name}</span>
              {f.unreadCount > 0 && <span className="folder-unread">{f.unreadCount}</span>}
            </div>
          ))}
        </>
      )}

      <div className="folder-group-title">{currentAccount?.email || 'Mailbox'}</div>
      {allFolders.map((f) => (
        <div
          key={f.id}
          className={`folder-item ${activeFolderId === f.id ? 'active' : ''}`}
          onClick={() => onSelectFolder(f.id)}
        >
          <span>{f.name}</span>
          {f.unreadCount > 0 && <span className="folder-unread">{f.unreadCount}</span>}
        </div>
      ))}
    </div>
  )
}

