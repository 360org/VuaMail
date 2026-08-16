import React, { useEffect, useState } from 'react'
import { AppRail, AppRailTab } from './components/sidebar/AppRail'
import { FolderTree } from './components/sidebar/FolderTree'
import { MailRibbon } from './components/ribbon/MailRibbon'
import { MailList } from './components/list/MailList'
import { ReadingPane } from './components/detail/ReadingPane'
import { ComposeModal } from './components/compose/ComposeModal'
import { PeopleView } from './components/people/PeopleView'
import { CalendarView } from './components/calendar/CalendarView'
import { TodoView } from './components/todo/TodoView'
import { ProfileView } from './components/profile/ProfileView'
import { ImportExportModal } from './components/wizard/ImportExportModal'
import { RulesModal } from './components/rules/RulesModal'
import { AiPanel } from './components/ai/AiPanel'
import { SettingsModal } from './components/settings/SettingsModal'
import type { MailFilterRule } from '@genoffice/mail-engine'
import type { EmailAccount, EmailBody, EmailMessage, MailFolder } from '../../shared/types'
import './styles/mail-theme.css'

export const App: React.FC = () => {
  const [activeRailTab, setActiveRailTab] = useState<AppRailTab>('mail')
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string>('acc_primary')
  const [folders, setFolders] = useState<MailFolder[]>([])
  const [activeFolderId, setActiveFolderId] = useState<string>('f_inbox')
  const [categoryTab, setCategoryTab] = useState<string>('all')
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [activeBody, setActiveBody] = useState<EmailBody | null>(null)
  const [isLoadingBody, setIsLoadingBody] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [isImportExportOpen, setIsImportExportOpen] = useState(false)
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true) // Open by default like GenMail
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [rules, setRules] = useState<MailFilterRule[]>([
    {
      id: 'r_vip',
      name: 'Thư quan trọng từ Sếp & Ban Giám Đốc',
      enabled: true,
      matchAllConditions: false,
      conditions: [
        { field: 'from', operator: 'contains', value: '360.org.vn' },
        { field: 'subject', operator: 'contains', value: 'Khẩn' },
      ],
      actions: [{ type: 'markAsStarred' }],
    },
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [composeInitial, setComposeInitial] = useState<{ to?: string; subject?: string; body?: string }>({})
  const [isSyncing, setIsSyncing] = useState(false)

  // Load initial accounts & all folders
  useEffect(() => {
    async function loadInitial() {
      if (!window.vuaMail) return
      const api = window.vuaMail
      const accList = await api.getAccounts()
      setAccounts(accList)
      if (accList.length > 0) {
        const primary = accList[0]
        setActiveAccountId(primary.id)
        // Fetch folders for all accounts to show complete folder tree
        const allFolderPromises = accList.map((acc) => api.getFolders(acc.id))
        const folderResults = await Promise.all(allFolderPromises)
        const combinedFolders = folderResults.flat()
        setFolders(combinedFolders)

        const defaultFolder = combinedFolders.find((f) => f.accountId === primary.id && f.kind === 'inbox') || combinedFolders[0]
        if (defaultFolder) {
          setActiveFolderId(defaultFolder.id)
        }
      }
    }
    loadInitial()
  }, [])

  // Switch account handler
  const handleSelectAccount = (accountId: string) => {
    setActiveAccountId(accountId)
    const accFolder = folders.find((f) => f.accountId === accountId && f.kind === 'inbox') || folders.find((f) => f.accountId === accountId)
    if (accFolder) {
      setActiveFolderId(accFolder.id)
    }
  }

  // Switch folder handler
  const handleSelectFolder = (folderId: string, accountId: string) => {
    setActiveAccountId(accountId)
    setActiveFolderId(folderId)
  }

  // Load emails when folder or category changes
  useEffect(() => {
    async function loadEmails() {
      if (!window.vuaMail || !activeFolderId) return
      const list = await window.vuaMail.getEmails(activeFolderId, categoryTab === 'primary' ? 'focused' : 'other')
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
    setIsAiPanelOpen(true)
    setAiSummary(
      `📌 Tóm tắt nội dung chính:\n• Email thông báo tiến độ cập nhật và vận hành của hệ sinh thái VuaMail.\n• Đã kết nối thành công SQLite Engine và giao diện Fluent UI Outlook 365.\n• Đề xuất Sếp kiểm tra lại và duyệt release.`
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

  const handlePreviewAttachment = async (att: any) => {
    if (!window.vuaMail) return
    await window.vuaMail.openAttachment(att)
  }

  const handleSyncNow = async () => {
    if (!window.vuaMail || isSyncing) return
    setIsSyncing(true)
    try {
      const status = await window.vuaMail.syncNow()
      if (status.syncedCount > 0) {
        // reload emails
        const list = await window.vuaMail.getEmails(activeFolderId, categoryTab === 'primary' ? 'focused' : 'other')
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
    // reload sent folder if viewing sent
    if (activeFolderId === 'f_sent' || activeFolderId === 'f2_sent') {
      const list = await window.vuaMail.getEmails(activeFolderId, categoryTab === 'primary' ? 'focused' : 'other')
      setEmails(list)
    }
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
      {/* GenMail Aubergine Modern Titlebar Header */}
      <div className="vuamail-header">
        <div className="vuamail-header-left">
          <div className="vuamail-brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>VuaOffice Mail</span>
          </div>

          <button className="compose-btn-header" onClick={handleOpenComposeNew}>
            <span>✏️</span>
            <span>Soạn thư</span>
          </button>
        </div>

        <div className="vuamail-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm thư, danh bạ, nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="vuamail-header-right">
          <button
            className={`ai-toggle-btn ${isAiPanelOpen ? 'active' : ''}`}
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
          >
            <span>✨</span>
            <span>AI Copilot</span>
          </button>

          <button
            className="settings-circle-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Cài đặt tài khoản Email"
          >
            ⚙️
          </button>

          <div className="header-account-tag">
            {activeAccount?.email || 'chau.le@360.org.vn'}
          </div>
        </div>
      </div>

      {/* Main Layout Container: NavRail + Curved Content Canvas */}
      <div className="vuamail-shell-layout">
        {/* Leftmost Nav Rail */}
        <AppRail activeTab={activeRailTab} onTabChange={setActiveRailTab} />

        {/* Curved Content Canvas Window */}
        <div className="vuamail-canvas-container">
          {/* Top Ribbon Toolbar */}
          <MailRibbon
            onNewEmail={handleOpenComposeNew}
            onImportExport={() => setIsImportExportOpen(true)}
            onManageRules={() => setIsRulesOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
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

          {/* Body Content Area */}
          <div className="vuamail-body">
            {activeRailTab === 'brain' && (
              <ProfileView
                accounts={accounts}
                activeAccountId={activeAccountId}
                onAccountsUpdated={async () => {
                  if (!window.vuaMail) return
                  const api = window.vuaMail
                  const accList = await api.getAccounts()
                  setAccounts(accList)
                  const allFolderPromises = accList.map((acc) => api.getFolders(acc.id))
                  const folderResults = await Promise.all(allFolderPromises)
                  const combinedFolders = folderResults.flat()
                  setFolders(combinedFolders)
                }}
                onSelectAccount={handleSelectAccount}
              />
            )}

            {activeRailTab === 'mail' && (
              <>
                <FolderTree
                  accounts={accounts}
                  activeAccountId={activeAccountId}
                  onSelectAccount={handleSelectAccount}
                  folders={folders}
                  activeFolderId={activeFolderId}
                  onSelectFolder={handleSelectFolder}
                />

                <MailList
                  emails={filteredEmails}
                  selectedEmailId={selectedEmailId}
                  onSelectEmail={setSelectedEmailId}
                  categoryTab={categoryTab}
                  onCategoryChange={setCategoryTab}
                  onRefresh={handleSyncNow}
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

                {/* GenMail AI Copilot Panel Right */}
                <AiPanel
                  isOpen={isAiPanelOpen}
                  onClose={() => setIsAiPanelOpen(false)}
                  selectedEmail={selectedEmail}
                  onApplyReply={handleSmartReply}
                  onCreateTask={(_t) => setActiveRailTab('todo')}
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
              <TodoView />
            )}
          </div>
        </div>
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

      {/* Import & Export Wizard Modal (.eml / .pst) */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportEml={async (parsed) => {
          if (!window.vuaMail || !activeAccount) return
          await window.vuaMail.sendEmail({
            accountId: activeAccount.id,
            to: [parsed.from?.address || 'imported@local'],
            subject: `[Imported] ${parsed.subject || '(No subject)'}`,
            bodyHtml: parsed.htmlBody || `<pre>${parsed.textBody || ''}</pre>`,
          })
          const list = await window.vuaMail.getEmails(activeFolderId, categoryTab === 'primary' ? 'focused' : 'other')
          setEmails(list)
        }}
      />

      {/* Outlook Rules & Filters Manager Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        rules={rules}
        onClose={() => setIsRulesOpen(false)}
        onSaveRules={(newRules) => {
          setRules(newRules)
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        accounts={accounts}
        activeAccountId={activeAccountId}
        onAccountsUpdated={async () => {
          if (!window.vuaMail) return
          const api = window.vuaMail
          const accList = await api.getAccounts()
          setAccounts(accList)
          const allFolderPromises = accList.map((acc) => api.getFolders(acc.id))
          const folderResults = await Promise.all(allFolderPromises)
          const combinedFolders = folderResults.flat()
          setFolders(combinedFolders)
          if (accList.length > 0 && !accList.some((a) => a.id === activeAccountId)) {
            setActiveAccountId(accList[0].id)
            const defaultFolder = combinedFolders.find((f) => f.accountId === accList[0].id && f.kind === 'inbox') || combinedFolders[0]
            if (defaultFolder) {
              setActiveFolderId(defaultFolder.id)
            }
          }
        }}
      />
    </div>
  )
}
