import React, { useState } from 'react'
import type { EmailAccount } from '../../../../shared/types'

interface ProfileViewProps {
  accounts: EmailAccount[]
  activeAccountId: string
  onAccountsUpdated: () => void
  onSelectAccount: (accountId: string) => void
}

type ProfileTab = 'profile' | 'accounts' | 'general' | 'signatures' | 'shortcuts'

const DEMO_FACTS = [
  'BSR-2025 (Việt Á Châu)',
  'New-hire onboarding (Thanh Nhàn Nguyễn)',
  'siec-star.edu.vn tenant administration',
  'VCloud Mobile 2.4 TestFlight',
  'OneDrive storage crisis',
]

const IDENTITY_FIELDS = [
  {
    label: 'Tên / Name',
    value: 'Chau Le',
  },
  {
    label: 'Vai trò / Role',
    value: 'CEO / founder-operator, 360 CORP (Công ty Cổ phần Đầu tư Phát triển Công nghệ 360)',
  },
  {
    label: 'Thương hiệu trực thuộc / Also operates',
    value: 'W360S CORP — adjacent brand, publisher of VCloud Mobile on TestFlight',
  },
  {
    label: 'Tổ chức / Organization',
    value: '360 CORP — Agentic AI, Cloud ERP/CRM (Odoo-based), Growth Ops for Vietnamese businesses',
  },
  {
    label: 'Trụ sở / HQ',
    value: 'Lầu 6, VCCI Tower, 155 Nguyễn Thái Học, Vũng Tàu',
  },
  {
    label: 'Địa điểm làm việc / Office location',
    value: '155 Nguyễn Thái Học, TP.HCM & Vũng Tàu',
  },
  {
    label: 'Ngôn ngữ / Languages',
    value: 'Vietnamese (primary), English (fluent-utilitarian; grammar loosens on mobile / low-stakes threads)',
  },
  {
    label: 'Giai đoạn phát triển / Life stage',
    value: 'Active operator/CEO of a growing SME; hiring cycle in progress; VCloud Mobile in intensive iteration',
  },
  {
    label: 'Nhịp làm việc / Working rhythm',
    value: 'Office 8:00–17:00 Mon–Sat; weekend-active — mailbox shows Saturday activity 11:00–17:00 ICT',
  },
]

export const ProfileView: React.FC<ProfileViewProps> = ({
  accounts,
  activeAccountId,
  onAccountsUpdated,
  onSelectAccount,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile')
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [authMethod, setAuthMethod] = useState<'oauth' | 'manual'>('oauth')
  const [oauthProvider, setOauthProvider] = useState<'google' | 'microsoft' | '360'>('microsoft')

  // Manual account form state
  const [provider, setProvider] = useState<'google' | 'microsoft' | 'custom_imap'>('custom_imap')
  const [accName, setAccName] = useState('')
  const [accEmail, setAccEmail] = useState('')
  const [accPassword, setAccPassword] = useState('')
  const [imapHost, setImapHost] = useState('imap.360.org.vn')
  const [imapPort, setImapPort] = useState(993)
  const [smtpHost, setSmtpHost] = useState('smtp.360.org.vn')
  const [smtpPort, setSmtpPort] = useState(587)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null)

  const [signatureText, setSignatureText] = useState(
    '--\nTrân trọng,\nChâu Lê\n360 CORP | VuaOffice Suite\nEmail: chau.le@360.org.vn | Website: https://360.org.vn'
  )

  // Trigger OAuth 2.0 / SSO Login Flow
  const handleStartOAuthLogin = async (selectedService: 'google' | 'microsoft' | '360') => {
    setIsAuthenticating(true)
    setAuthStatusMessage(`Đang kết nối xác thực OAuth 2.0 với ${selectedService.toUpperCase()}...`)

    try {
      if (selectedService === 'microsoft') {
        const dummyEmail = 'chau.le@outlook.com'
        const dummyName = 'Châu Lê (Microsoft 365)'
        if (window.vuaMail) {
          await window.vuaMail.addAccount({
            email: dummyEmail,
            name: dummyName,
            provider: 'microsoft',
          })
          onAccountsUpdated()
          onSelectAccount('acc_primary')
        }
      } else if (selectedService === 'google') {
        const dummyEmail = 'chaule.360corp@gmail.com'
        const dummyName = 'Châu Lê (Google Workspace)'
        if (window.vuaMail) {
          await window.vuaMail.addAccount({
            email: dummyEmail,
            name: dummyName,
            provider: 'google',
          })
          onAccountsUpdated()
        }
      } else {
        const dummyEmail = 'chau.le@360.org.vn'
        const dummyName = 'Châu Lê (360 CORP Direct SSO)'
        if (window.vuaMail) {
          await window.vuaMail.addAccount({
            email: dummyEmail,
            name: dummyName,
            provider: 'custom_imap',
            imapHost: 'imap.360.org.vn',
            imapPort: 993,
            smtpHost: 'smtp.360.org.vn',
            smtpPort: 587,
          })
          onAccountsUpdated()
        }
      }
      setAuthStatusMessage('Đăng nhập và cấp quyền thành công!')
      setTimeout(() => {
        setIsAddingAccount(false)
        setIsAuthenticating(false)
        setAuthStatusMessage(null)
      }, 800)
    } catch (err: any) {
      setAuthStatusMessage(`Lỗi xác thực: ${err.message || 'Không thể hoàn tất đăng nhập'}`)
      setIsAuthenticating(false)
    }
  }

  const handleCreateAccountManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accEmail.trim() || !window.vuaMail) return
    setIsAuthenticating(true)
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
      setIsAuthenticating(false)
    }
  }

  const handleRemoveAccount = async (id: string) => {
    if (!window.vuaMail) return
    if (confirm('Sếp có chắc chắn muốn đăng xuất và ngắt kết nối tài khoản này?')) {
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
    <div className="brain-container">
      <div className="brain-scroll-area">
        {/* Header Hero Section */}
        <div className="brain-header">
          <div className="brain-header-main">
            <h1 className="brain-title">Hồ sơ & Cài đặt Email (Profile & Settings)</h1>
            <div className="brain-subtitle">
              Quản lý tài khoản, kết nối xác thực OAuth, trí tuệ AI và cấu hình hệ thống VuaMail
            </div>
          </div>
          <div className="brain-badge-group">
            <span className="brain-badge highlight">{accounts.length} tài khoản kết nối</span>
            <span className="brain-badge">360 CORP ID</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="brain-tabs-bar">
          <button
            className={`brain-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span>🧠</span>
            <span>Hồ sơ & Trí tuệ AI (Brain)</span>
          </button>
          <button
            className={`brain-tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <span>👥</span>
            <span>Tài khoản & Xác thực (OAuth / IMAP)</span>
          </button>
          <button
            className={`brain-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <span>⚙️</span>
            <span>Cấu hình chung (General)</span>
          </button>
          <button
            className={`brain-tab-btn ${activeTab === 'signatures' ? 'active' : ''}`}
            onClick={() => setActiveTab('signatures')}
          >
            <span>✍️</span>
            <span>Chữ ký thư</span>
          </button>
          <button
            className={`brain-tab-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            <span>⌨️</span>
            <span>Phím tắt</span>
          </button>
        </div>

        {/* TAB 1: PROFILE & BRAIN */}
        {activeTab === 'profile' && (
          <div>
            <div className="brain-card hero-card">
              <div className="brain-card-title">Chủ đề & Dự án nổi bật gần đây</div>
              <ul className="brain-facts-list">
                {DEMO_FACTS.map((fact, idx) => (
                  <li key={idx} className="brain-fact-item">
                    <span className="brain-bullet">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
              <div className="brain-card-footer">
                <span className="brain-read-count">Đã đọc và đồng bộ hóa từ các hộp thư 360 CORP</span>
              </div>
            </div>

            <div className="brain-section-title">Identity & Profile (Hồ sơ Sếp & Doanh nghiệp)</div>
            <div className="brain-identity-grid">
              {IDENTITY_FIELDS.map((item, idx) => (
                <div key={idx} className="brain-card identity-card">
                  <div className="identity-label">{item.label}</div>
                  <div className="identity-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ACCOUNTS & AUTH */}
        {activeTab === 'accounts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Hộp thư & Tài khoản đã đăng nhập ({accounts.length})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Hỗ trợ đăng nhập nhanh qua Microsoft 365, Google Workspace hoặc IMAP/SMTP doanh nghiệp.
                </div>
              </div>

              {!isAddingAccount && (
                <button
                  onClick={() => setIsAddingAccount(true)}
                  style={{
                    backgroundColor: 'var(--outlook-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>+</span>
                  <span>Đăng nhập tài khoản mới</span>
                </button>
              )}
            </div>

            {/* Login / Auth Modal Form */}
            {isAddingAccount && (
              <div
                style={{
                  backgroundColor: 'var(--surface-subtle, #f8fafc)',
                  border: '1px solid var(--border, #e2e8f0)',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--outlook-blue)' }}>
                    🔐 Thêm tài khoản & Xác thực an toàn (Authentication)
                  </div>

                  {/* Toggle OAuth vs Manual IMAP */}
                  <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--surface)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('oauth')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: authMethod === 'oauth' ? 'var(--outlook-blue)' : 'transparent',
                        color: authMethod === 'oauth' ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      OAuth 2.0 / SSO (Khuyến nghị)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('manual')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: authMethod === 'manual' ? 'var(--outlook-blue)' : 'transparent',
                        color: authMethod === 'manual' ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      Thủ công IMAP/SMTP
                    </button>
                  </div>
                </div>

                {authMethod === 'oauth' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Chọn nhà cung cấp để mở trang đăng nhập xác thực tài khoản (OAuth 2.0 / Modern Auth):
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      {/* Microsoft OAuth */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('microsoft')}
                        disabled={isAuthenticating}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid var(--border, #e2e8f0)',
                          backgroundColor: 'var(--surface, #ffffff)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>🟦</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Microsoft Outlook</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Office 365 / Exchange</span>
                      </button>

                      {/* Google OAuth */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('google')}
                        disabled={isAuthenticating}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid var(--border, #e2e8f0)',
                          backgroundColor: 'var(--surface, #ffffff)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>🔴</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Google Workspace</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gmail / Workspace</span>
                      </button>

                      {/* 360 CORP SSO */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('360')}
                        disabled={isAuthenticating}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid var(--border, #e2e8f0)',
                          backgroundColor: 'var(--surface, #ffffff)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>🌐</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>360 CORP SSO</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>360.org.vn Server</span>
                      </button>
                    </div>

                    {authStatusMessage && (
                      <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: 'var(--outlook-blue-soft)', color: 'var(--outlook-blue)', fontSize: '12px', fontWeight: 500 }}>
                        ⏳ {authStatusMessage}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setIsAddingAccount(false)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid var(--border)',
                          padding: '6px 14px',
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
                  /* Manual Form */
                  <form onSubmit={handleCreateAccountManual} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                          Địa chỉ Email:
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="admin@360.org.vn"
                          value={accEmail}
                          onChange={(e) => setAccEmail(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                          Tên hiển thị:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Châu Lê"
                          value={accName}
                          onChange={(e) => setAccName(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                          Mật khẩu ứng dụng (App Password):
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={accPassword}
                          onChange={(e) => setAccPassword(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                          Loại giao thức:
                        </label>
                        <select
                          value={provider}
                          onChange={(e: any) => setProvider(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', boxSizing: 'border-box' }}
                        >
                          <option value="custom_imap">Custom IMAP / SMTP</option>
                          <option value="microsoft">Microsoft Exchange</option>
                          <option value="google">Google Workspace</option>
                        </select>
                      </div>
                    </div>

                    {provider === 'custom_imap' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>IMAP Host:</label>
                          <input type="text" value={imapHost} onChange={(e) => setImapHost(e.target.value)} style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Port:</label>
                          <input type="number" value={imapPort} onChange={(e) => setImapPort(Number(e.target.value))} style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SMTP Host:</label>
                          <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Port:</label>
                          <input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                      <button type="button" onClick={() => setIsAddingAccount(false)} style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>
                        Hủy
                      </button>
                      <button type="submit" disabled={isAuthenticating} style={{ backgroundColor: 'var(--outlook-blue)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        {isAuthenticating ? 'Đang xác thực...' : 'Lưu tài khoản'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* List connected accounts */}
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
                          backgroundColor: 'var(--outlook-blue)',
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
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                            {acc.name}
                          </span>
                          {isPrimary && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                backgroundColor: 'var(--outlook-blue-soft)',
                                color: 'var(--outlook-blue)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              Hộp thư chính
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {acc.email} • {acc.provider.toUpperCase()} • Đang đồng bộ tự động
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(acc.id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            fontSize: '11px',
                            cursor: 'pointer',
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
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            color: '#d13438',
                          }}
                        >
                          Đăng xuất
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GENERAL */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Chu kỳ đồng bộ email tự động (Auto-sync Interval):
              </label>
              <select
                defaultValue="60"
                style={{
                  padding: '7px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <option value="30">Mỗi 30 giây (Real-time)</option>
                <option value="60">Mỗi 1 phút (Khuyến nghị)</option>
                <option value="300">Mỗi 5 phút</option>
                <option value="0">Thủ công (Khi bấm Send/Receive)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Trình xem trước tệp đính kèm:
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <input type="checkbox" defaultChecked />
                <span>Tự động mở DOCX, XLSX, PPTX, PDF trực tiếp trên VuaOffice Tab Engine</span>
              </label>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                VuaOffice AI Copilot:
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <input type="checkbox" defaultChecked />
                <span>Tự động gợi ý câu trả lời thông minh (Smart Reply) và tóm tắt thư</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: SIGNATURES */}
        {activeTab === 'signatures' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
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
                border: '1px solid var(--border)',
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
                backgroundColor: 'var(--outlook-blue)',
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

        {/* TAB 5: SHORTCUTS */}
        {activeTab === 'shortcuts' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--surface)' }}>
              <strong>⌘ + N / Ctrl + N</strong>: Soạn thư mới (New Mail)
            </div>
            <div style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--surface)' }}>
              <strong>⌘ + R / Ctrl + R</strong>: Phản hồi thư (Reply)
            </div>
            <div style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--surface)' }}>
              <strong>Delete / Backspace</strong>: Xóa thư (Delete)
            </div>
            <div style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--surface)' }}>
              <strong>⌘ + F / Ctrl + F</strong>: Tìm kiếm email (Search)
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
