import React, { useEffect, useState } from 'react'
import { AppRail, AppRailTab } from './components/sidebar/AppRail'
import { FolderTree } from './components/sidebar/FolderTree'
import { MailRibbon } from './components/ribbon/MailRibbon'
import { MailList } from './components/list/MailList'
import { ReadingPane } from './components/detail/ReadingPane'
import { ComposeModal } from './components/compose/ComposeModal'
import { PeopleView } from './components/people/PeopleView'
import { CalendarView } from './components/calendar/CalendarView'
import type { EmailAccount, EmailBody, EmailMessage, MailFolder } from '../../shared/types'
import './styles/mail-theme.css'

export const App: React.FC = () => {
  const [activeRailTab, setActiveRailTab] = useState<AppRailTab>('mail')
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string>('acc_primary')
  const [folders, setFolders] = useState<MailFolder[]>([])
  const [activeFolderId, setActiveFolderId] = useState<string>('f_inbox')
  const [categoryTab, setCategoryTab] = useState<'focused' | 'other'>('focused')
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [activeBody, setActiveBody] = useState<EmailBody | null>(null)
  const [isLoadingBody, setIsLoadingBody] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [composeInitial, setComposeInitial] = useState<{ to?: string; subject?: string; body?: string }>({})
  const [isSyncing, setIsSyncing] = useState(false)

  // Load initial accounts & folders
  useEffect(() => {
    async function loadInitial() {
      if (!window.vuaMail) return
      const accList = await window.vuaMail.getAccounts()
      setAccounts(accList)
      if (accList.length > 0) {
        const primary = accList[0]
        setActiveAccountId(primary.id)
        const fList = await window.vuaMail.getFolders(primary.id)
        setFolders(fList)
        if (fList.length > 0) {
          setActiveFolderId(fList[0].id)
        }
      }
    }
    loadInitial()
  }, [])

  // Switch account handler
  const handleSelectAccount = async (accountId: string) => {
    setActiveAccountId(accountId)
    if (!window.vuaMail) return
    const fList = await window.vuaMail.getFolders(accountId)
    setFolders(fList)
    if (fList.length > 0) {
      setActiveFolderId(fList[0].id)
    }
  }

  // Load emails when folder or category changes
  useEffect(() => {
    async function loadEmails() {
      if (!window.vuaMail || !activeFolderId) return
      const list = await window.vuaMail.getEmails(activeFolderId, categoryTab)
      setEmails(list)
      if (list.length > 0) {
        setSelectedEmailId(list[0].id)
      } else {
        setSelectedEmailId(null)
        setActiveBody(null)
      }
    }
    loadEmails()
  }, [activeFolderId, categoryTab])

  // Load email body when selection changes
  useEffect(() => {
    async function loadBody() {
      if (!window.vuaMail || !selectedEmailId) {
        setActiveBody(null)
        setAiSummary(null)
        return
      }
      setIsLoadingBody(true)
      setAiSummary(null)
      const body = await window.vuaMail.getEmailBody(selectedEmailId)
      setActiveBody(body)
      setIsLoadingBody(false)
    }
    loadBody()
  }, [selectedEmailId])

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0] || null
  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null

  const filteredEmails = emails.filter((e) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      e.subject.toLowerCase().includes(q) ||
      e.senderName.toLowerCase().includes(q) ||
      e.snippet.toLowerCase().includes(q)
    )
  })

  const handleDelete = async () => {
    if (!window.vuaMail || !selectedEmailId) return
    await window.vuaMail.deleteEmail(selectedEmailId)
    setEmails((prev) => prev.filter((e) => e.id !== selectedEmailId))
    setSelectedEmailId(null)
  }

  const handleArchive = async () => {
    if (!window.vuaMail || !selectedEmailId) return
    await window.vuaMail.archiveEmail(selectedEmailId)
    setEmails((prev) => prev.filter((e) => e.id !== selectedEmailId))
    setSelectedEmailId(null)
  }

  const handleTriggerAiSummary = () => {
    if (!selectedEmail) return
    setAiSummary(
      `📌 Tóm tắt nội dung chính:\n• Email thông báo tiến độ cập nhật và vận hành của hệ thống VuaMail.\n• Đã kết nối thành công SQLite Engine và giao diện Fluent UI Outlook 365.\n• Đề xuất Sếp kiểm tra lại và duyệt release.`
    )
  }

  const handleSmartReply = (replyText: string) => {
    if (!selectedEmail) return
    setComposeInitial({
      to: selectedEmail.senderEmail,
      subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
      body: `${replyText}\n\n---\nOn ${new Date(selectedEmail.dateIso).toLocaleString()}, ${selectedEmail.senderName} wrote:\n> ${selectedEmail.snippet}`,
    })
    setIsComposeOpen(true)
  }

  const handleOpenComposeNew = () => {
    setComposeInitial({})
    setIsComposeOpen(true)
  }

  const handleReplySelected = () => {
    if (!selectedEmail) return
    setComposeInitial({
      to: selectedEmail.senderEmail,
      subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
      body: `\n\n---\nOn ${new Date(selectedEmail.dateIso).toLocaleString()}, ${selectedEmail.senderName} wrote:\n> ${selectedEmail.snippet}`,
    })
    setIsComposeOpen(true)
  }

  const handlePreviewAttachment = (att: { filename: string }) => {
    alert(`Đang mở xem trước tệp tài liệu: ${att.filename}\n(Tích hợp Office Engine Viewer)`)
  }

  const handleSyncNow = async () => {
    if (!window.vuaMail || isSyncing) return
    setIsSyncing(true)
    try {
      const status = await window.vuaMail.syncNow()
      if (status.syncedCount > 0) {
        // reload emails
        const list = await window.vuaMail.getEmails(activeFolderId, categoryTab)
        setEmails(list)
      }
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSendDraft = async (draft: { to: string[]; subject: string; bodyHtml: string }) => {
    if (!window.vuaMail || !activeAccount) return
    await window.vuaMail.sendEmail({
      accountId: activeAccount.id,
      to: draft.to,
      subject: draft.subject,
      bodyHtml: draft.bodyHtml,
    })
  }

  const handleSendEmailToContact = (email: string, _name: string) => {
    setComposeInitial({
      to: email,
      subject: '',
      body: '',
    })
    setIsComposeOpen(true)
  }

  return (
    <div className="vuamail-app">
      {/* Outlook Top Header */}
      <div className="vuamail-header">
        <div className="vuamail-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>VuaOffice Mail</span>
        </div>

        <div className="vuamail-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search email, contacts, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500 }}>{activeAccount?.email || 'chau.le@360.org.vn'}</div>
      </div>

      {/* Top Ribbon Toolbar */}
      <MailRibbon
        onNewEmail={handleOpenComposeNew}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onReply={handleReplySelected}
        onReplyAll={handleReplySelected}
        onForward={handleReplySelected}
        onAiAssist={handleTriggerAiSummary}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        hasSelectedEmail={Boolean(selectedEmail)}
      />

      {/* Outlook Main Body */}
      <div className="vuamail-body">
        <AppRail activeTab={activeRailTab} onTabChange={setActiveRailTab} />

        {activeRailTab === 'mail' && (
          <>
            <FolderTree
              accounts={accounts}
              activeAccountId={activeAccountId}
              onSelectAccount={handleSelectAccount}
              folders={folders}
              activeFolderId={activeFolderId}
              onSelectFolder={setActiveFolderId}
            />

            <MailList
              emails={filteredEmails}
              selectedEmailId={selectedEmailId}
              onSelectEmail={setSelectedEmailId}
              categoryTab={categoryTab}
              onCategoryChange={setCategoryTab}
            />

            <ReadingPane
              email={selectedEmail}
              body={activeBody}
              aiSummary={aiSummary}
              isLoadingBody={isLoadingBody}
              onTriggerAiSummary={handleTriggerAiSummary}
              onSmartReply={handleSmartReply}
              onPreviewAttachment={handlePreviewAttachment}
            />
          </>
        )}

        {activeRailTab === 'people' && (
          <PeopleView onSendEmailTo={handleSendEmailToContact} />
        )}

        {activeRailTab === 'calendar' && (
          <CalendarView />
        )}

        {activeRailTab === 'todo' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            📝 To-Do & Tasks Sync (Sắp ra mắt trong bản cập nhật kế tiếp)
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        initialTo={composeInitial.to}
        initialSubject={composeInitial.subject}
        initialBody={composeInitial.body}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendDraft}
      />
    </div>
  )
}

