import React, { useState } from 'react'
import type { EmailAccount } from '../../../../shared/types'
import {
  IconSettings,
  IconUsers,
  IconEdit,
  IconKeyboard,
  IconX,
  IconLock,
  IconMicrosoft,
  IconGoogle,
  IconGlobe,
} from '../common/MailIcons'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  accounts: EmailAccount[]
  activeAccountId: string
  onAccountsUpdated: () => void
}

type SettingsTab = 'general' | 'accounts' | 'signatures' | 'shortcuts'

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  activeAccountId,
  onAccountsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('accounts')
  const [isAddingAccount, setIsAddingAccount] = useState(false)

  // New account form state
  const [provider, setProvider] = useState<'google' | 'microsoft' | 'custom_imap'>('custom_imap')
  const [accName, setAccName] = useState('')
  const [accEmail, setAccEmail] = useState('')
  const [accPassword, setAccPassword] = useState('')
  const [imapHost, setImapHost] = useState('imap.360.org.vn')
  const [imapPort, setImapPort] = useState(993)
  const [smtpHost, setSmtpHost] = useState('smtp.360.org.vn')
  const [smtpPort, setSmtpPort] = useState(587)
  const [authMethod, setAuthMethod] = useState<'oauth' | 'manual'>('oauth')
  const [isSaving, setIsSaving] = useState(false)
  const [authStatus, setAuthStatus] = useState<string | null>(null)
  const [signatureText, setSignatureText] = useState(
    '--\nTrân trọng,\nChâu Lê\n360 CORP | VuaOffice Suite\nEmail: chau.le@360.org.vn | Website: https://360.org.vn'
  )

  if (!isOpen) return null

  const handleStartOAuthLogin = async (selectedService: 'google' | 'microsoft' | '360' | 'auto', emailHintInput?: string) => {
    setIsSaving(true)
    const emailToUse = emailHintInput || accEmail
    setAuthStatus(`Đang mở cửa sổ trình duyệt đăng nhập ${selectedService.toUpperCase()}...`)

    try {
      if (window.vuaMail) {
        const result = await window.vuaMail.startOAuthFlow(selectedService, emailToUse)
        if (result && result.success) {
          setAuthStatus('Xác thực và cấp quyền thành công!')
          onAccountsUpdated()
          setTimeout(() => {
            setIsAddingAccount(false)
            setIsSaving(false)
            setAuthStatus(null)
          }, 600)
        } else {
          setAuthStatus(result?.error || 'Xác thực không thành công')
          setIsSaving(false)
        }
      }
    } catch (err: any) {
      setAuthStatus(`Lỗi xác thực: ${err.message || 'Không thể đăng nhập'}`)
      setIsSaving(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accEmail.trim() || !window.vuaMail) return
    setIsSaving(true)
    try {
      await window.vuaMail.addAccount({
        email: accEmail.trim(),
        name: accName.trim() || accEmail.split('@')[0],
        provider,
        imapHost: provider === 'custom_imap' ? imapHost : undefined,
        imapPort: provider === 'custom_imap' ? Number(imapPort) : undefined,
        smtpHost: provider === 'custom_imap' ? smtpHost : undefined,
        smtpPort: provider === 'custom_imap' ? Number(smtpPort) : undefined,
        password: accPassword,
      })
      setIsAddingAccount(false)
      setAccEmail('')
      setAccName('')
      setAccPassword('')
      onAccountsUpdated()
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveAccount = async (id: string) => {
    if (!window.vuaMail) return
    if (confirm('Sếp có chắc chắn muốn ngắt kết nối tài khoản email này?')) {
      await window.vuaMail.removeAccount(id)
      onAccountsUpdated()
    }
  }

  const handleSetPrimary = async (id: string) => {
    if (!window.vuaMail) return
    await window.vuaMail.setPrimaryAccount(id)
    onAccountsUpdated()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '780px',
          height: '560px',
          backgroundColor: 'var(--surface, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          overflow: 'hidden',
          border: '1px solid var(--border, #e3e6ea)',
        }}
      >
        {/* Settings Left Navigation Sidebar */}
        <div
          style={{
            width: '210px',
            backgroundColor: 'var(--surface-subtle, #f6f7f9)',
            borderRight: '1px solid var(--border, #e3e6ea)',
            padding: '24px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary, #232425)', padding: '0 10px 16px 10px' }}>
            Cài đặt (Settings)
          </div>

          <button
            onClick={() => setActiveTab('general')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'general' ? 'var(--vuamail-primary-blue-soft, #e5f3fc)' : 'transparent',
              color: activeTab === 'general' ? 'var(--vuamail-primary-blue, #0077cd)' : 'var(--text-primary, #232425)',
              fontWeight: activeTab === 'general' ? 600 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <IconSettings size={15} color={activeTab === 'general' ? 'var(--vuamail-primary-blue, #0077cd)' : 'var(--text-secondary, #606366)'} />
            <span>Chung (General)</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'accounts' ? 'var(--vuamail-primary-blue-soft, #e5f3fc)' : 'transparent',
              color: activeTab === 'accounts' ? 'var(--vuamail-primary-blue, #0077cd)' : 'var(--text-primary, #232425)',
              fontWeight: activeTab === 'accounts' ? 600 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <IconUsers size={15} color={activeTab === 'accounts' ? 'var(--vuamail-primary-blue, #0077cd)' : 'var(--text-secondary, #606366)'} />
            <span>Tài khoản Mail</span>
          </button>

          <button
            onClick={() => setActiveTab('signatures')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'signatures' ? 'var(--vuamail-primary-blue-soft, #e5f3fc)' : 'transparent',
              color: activeTab === 'signatures' ? 'var(--vuamail-primary-blue, #0077cd)' : 'var(--text-primary, #232425)',
              fontWeight: activeTab === 'signatures' ? 600 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <IconEdit size={15} color={activeTab === 'signatures' ? 'var(--vuamail-primary-blue, #0077cd)' : 'var(--text-secondary, #606366)'} />
            <span>Chữ ký thư</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'shortcuts' ? 'var(--vuamail-primary-blue-soft, #e5f3fc)' : 'transparent',
              color: activeTab === 'shortcuts' ? 'var(--vuamail-primary-blue, #0077cd)' : 'var(--text-primary, #232425)',
              fontWeight: activeTab === 'shortcuts' ? 600 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <IconKeyboard size={15} color={activeTab === 'shortcuts' ? 'var(--vuamail-primary-blue, #0077cd)' : 'var(--text-secondary, #606366)'} />
            <span>Phím tắt</span>
          </button>
        </div>

        {/* Settings Right Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface, #ffffff)', overflow: 'hidden' }}>
          {/* Top Bar with Close Button */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border, #e3e6ea)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>
              {activeTab === 'general' && 'Cấu hình hệ thống chung'}
              {activeTab === 'accounts' && 'Quản lý Tài khoản Mail & Kết nối Live IMAP/SMTP'}
              {activeTab === 'signatures' && 'Quản lý Chữ ký điện tử'}
              {activeTab === 'shortcuts' && 'Danh mục Phím tắt VuaMail'}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted, #878e96)',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconX size={16} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {/* TAB: ACCOUNTS */}
            {activeTab === 'accounts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>
                      Danh sách tài khoản ({accounts.length})
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted, #878e96)' }}>
                      Tài khoản trên cùng là tài khoản mặc định gửi thư.
                    </div>
                  </div>

                  {!isAddingAccount && (
                    <button
                      onClick={() => setIsAddingAccount(true)}
                      style={{
                        backgroundColor: '#0078d4',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Thêm tài khoản mới
                    </button>
                  )}
                </div>

                {/* Add Account Live Form */}
                {isAddingAccount && (
                  <div
                    style={{
                      backgroundColor: 'var(--surface-subtle, #f6f7f9)',
                      border: '1px solid var(--border, #e3e6ea)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--vuamail-primary-blue, #0077cd)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconLock size={14} color="var(--vuamail-primary-blue, #0077cd)" />
                        <span>Thêm tài khoản & Xác thực (OAuth 2.0 / SSO):</span>
                      </div>

                      {/* Toggle OAuth vs Manual IMAP */}
                      <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        <button
                          type="button"
                          onClick={() => setAuthMethod('oauth')}
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: '3px',
                            backgroundColor: authMethod === 'oauth' ? 'var(--vuamail-primary-blue, #0077cd)' : 'transparent',
                            color: authMethod === 'oauth' ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          OAuth 2.0 / SSO
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMethod('manual')}
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: '3px',
                            backgroundColor: authMethod === 'manual' ? 'var(--vuamail-primary-blue, #0077cd)' : 'transparent',
                            color: authMethod === 'manual' ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          Thủ công IMAP
                        </button>
                      </div>
                    </div>

                    {authMethod === 'oauth' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* 1-Input Flow */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Nhập địa chỉ Email để kết nối tự động:
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="email"
                              placeholder="Nhập email của Sếp (VD: chau.le@outlook.com, sếp@gmail.com)..."
                              value={accEmail}
                              onChange={(e) => setAccEmail(e.target.value)}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                fontSize: '12px',
                                outline: 'none',
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && accEmail.trim()) {
                                  handleStartOAuthLogin('auto', accEmail.trim())
                                }
                              }}
                            />
                            <button
                              type="button"
                              disabled={!accEmail.trim() || isSaving}
                              onClick={() => handleStartOAuthLogin('auto', accEmail.trim())}
                              style={{
                                backgroundColor: 'var(--outlook-blue, #0078d4)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: accEmail.trim() ? 'pointer' : 'not-allowed',
                                opacity: accEmail.trim() && !isSaving ? 1 : 0.6,
                              }}
                            >
                              {isSaving ? 'Đang mở...' : 'Tiếp tục →'}
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('microsoft')}
                            disabled={isSaving}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconMicrosoft size={24} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Microsoft Outlook</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Office 365 / Exchange</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('google')}
                            disabled={isSaving}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconGoogle size={24} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Google Workspace</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gmail / Workspace</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('360')}
                            disabled={isSaving}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconGlobe size={24} color="var(--vuamail-primary-blue, #0077cd)" />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>360 CORP SSO</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>360.org.vn Server</span>
                          </button>
                        </div>

                        {authStatus && (
                          <div style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: 'var(--vuamail-primary-blue-soft, #e5f3fc)', color: 'var(--vuamail-primary-blue, #0077cd)', fontSize: '12px', fontWeight: 500 }}>
                            {authStatus}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setIsAddingAccount(false)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border)',
                              padding: '5px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleCreateAccount}
                        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary, #232425)', display: 'block', marginBottom: '4px' }}>
                              Giao thức / Nhà cung cấp:
                            </label>
                            <select
                              value={provider}
                              onChange={(e: any) => setProvider(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '4px',
                                border: '1px solid var(--border, #e3e6ea)',
                                backgroundColor: 'var(--surface, #ffffff)',
                                color: 'var(--text-primary, #232425)',
                                fontSize: '12px',
                              }}
                            >
                              <option value="custom_imap">Custom IMAP / SMTP (Doanh nghiệp)</option>
                              <option value="microsoft">Microsoft Outlook / Office 365</option>
                              <option value="google">Google Workspace / Gmail</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary, #232425)', display: 'block', marginBottom: '4px' }}>
                              Tên hiển thị người gửi:
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ví dụ: Châu Lê (360 CORP)"
                              value={accName}
                              onChange={(e) => setAccName(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '4px',
                                border: '1px solid var(--border, #e3e6ea)',
                                backgroundColor: 'var(--surface, #ffffff)',
                                color: 'var(--text-primary, #232425)',
                                fontSize: '12px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary, #232425)', display: 'block', marginBottom: '4px' }}>
                              Địa chỉ Email:
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="admin@360.org.vn"
                              value={accEmail}
                              onChange={(e) => setAccEmail(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '4px',
                                border: '1px solid var(--border, #e3e6ea)',
                                backgroundColor: 'var(--surface, #ffffff)',
                                color: 'var(--text-primary, #232425)',
                                fontSize: '12px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary, #232425)', display: 'block', marginBottom: '4px' }}>
                              Mật khẩu / App Password:
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="••••••••••••"
                              value={accPassword}
                              onChange={(e) => setAccPassword(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '4px',
                                border: '1px solid var(--border, #e3e6ea)',
                                backgroundColor: 'var(--surface, #ffffff)',
                                color: 'var(--text-primary, #232425)',
                                fontSize: '12px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                        </div>

                        {provider === 'custom_imap' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', gap: '10px', marginTop: '4px' }}>
                            <div>
                              <label style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', display: 'block', marginBottom: '3px' }}>IMAP Host:</label>
                              <input
                                type="text"
                                value={imapHost}
                                onChange={(e) => setImapHost(e.target.value)}
                                style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid var(--border, #e3e6ea)', fontSize: '11px', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', display: 'block', marginBottom: '3px' }}>Port:</label>
                              <input
                                type="number"
                                value={imapPort}
                                onChange={(e) => setImapPort(Number(e.target.value))}
                                style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid var(--border, #e3e6ea)', fontSize: '11px', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', display: 'block', marginBottom: '3px' }}>SMTP Host:</label>
                              <input
                                type="text"
                                value={smtpHost}
                                onChange={(e) => setSmtpHost(e.target.value)}
                                style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid var(--border, #e3e6ea)', fontSize: '11px', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', display: 'block', marginBottom: '3px' }}>Port:</label>
                              <input
                                type="number"
                                value={smtpPort}
                                onChange={(e) => setSmtpPort(Number(e.target.value))}
                                style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid var(--border, #e3e6ea)', fontSize: '11px', boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setIsAddingAccount(false)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border, #e3e6ea)',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            disabled={isSaving}
                            style={{
                              backgroundColor: '#0078d4',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 16px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {isSaving ? 'Đang kết nối...' : 'Xác thực & Thêm tài khoản'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Accounts Listing Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {accounts.map((acc) => {
                    const isPrimary = acc.isDefault || acc.id === activeAccountId
                    const initial = (acc.name || acc.email).charAt(0).toUpperCase()

                    return (
                      <div
                        key={acc.id}
                        style={{
                          border: '1px solid var(--border, #e3e6ea)',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: 'var(--surface, #ffffff)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: '#0078d4',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                            }}
                          >
                            {initial}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary, #232425)' }}>
                                {acc.name}
                              </span>
                              {isPrimary && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    backgroundColor: '#e8f2fc',
                                    color: '#0078d4',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  Primary
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', marginTop: '2px' }}>
                              {acc.email} • {acc.provider.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!isPrimary && (
                            <button
                              onClick={() => handleSetPrimary(acc.id)}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--border, #e3e6ea)',
                                borderRadius: '4px',
                                padding: '5px 10px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                color: 'var(--text-primary, #232425)',
                              }}
                            >
                              Đặt làm chính
                            </button>
                          )}
                          {accounts.length > 1 && (
                            <button
                              onClick={() => handleRemoveAccount(acc.id)}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--border, #e3e6ea)',
                                borderRadius: '4px',
                                padding: '5px 10px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                color: '#d13438',
                              }}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB: GENERAL */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #232425)', display: 'block', marginBottom: '6px' }}>
                    Chu kỳ đồng bộ email tự động (Auto-sync Interval):
                  </label>
                  <select
                    defaultValue="60"
                    style={{
                      padding: '7px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--border, #e3e6ea)',
                      fontSize: '12px',
                      backgroundColor: 'var(--surface, #ffffff)',
                    }}
                  >
                    <option value="30">Mỗi 30 giây (Real-time)</option>
                    <option value="60">Mỗi 1 phút (Khuyến nghị)</option>
                    <option value="300">Mỗi 5 phút</option>
                    <option value="0">Thủ công (Khi bấm Send/Receive)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #232425)', display: 'block', marginBottom: '6px' }}>
                    Trình xem trước tệp đính kèm:
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary, #232425)' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Tự động mở DOCX, XLSX, PPTX, PDF trực tiếp trên VuaOffice Tab Engine</span>
                  </label>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #232425)', display: 'block', marginBottom: '6px' }}>
                    VuaOffice AI Copilot:
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary, #232425)' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Tự động gợi ý câu trả lời thông minh (Smart Reply) và tóm tắt thư</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: SIGNATURES */}
            {activeTab === 'signatures' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>
                  Chữ ký điện tử mặc định khi soạn thư mới:
                </div>
                <textarea
                  rows={8}
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border, #e3e6ea)',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => alert('Đã lưu chữ ký thành công!')}
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#0078d4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Lưu chữ ký
                </button>
              </div>
            )}

            {/* TAB: SHORTCUTS */}
            {activeTab === 'shortcuts' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border, #e3e6ea)', borderRadius: '6px' }}>
                  <strong>⌘ + N / Ctrl + N</strong>: Soạn thư mới (New Mail)
                </div>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border, #e3e6ea)', borderRadius: '6px' }}>
                  <strong>⌘ + R / Ctrl + R</strong>: Phản hồi thư (Reply)
                </div>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border, #e3e6ea)', borderRadius: '6px' }}>
                  <strong>Delete / Backspace</strong>: Xóa thư (Delete)
                </div>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border, #e3e6ea)', borderRadius: '6px' }}>
                  <strong>⌘ + F / Ctrl + F</strong>: Tìm kiếm email (Search)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
