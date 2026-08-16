import React, { useState } from 'react'
import type { EmailAttachment, EmailBody, EmailMessage } from '../../../../shared/types'

interface ReadingPaneProps {
  email: EmailMessage | null
  body: EmailBody | null
  aiSummary: string | null
  isLoadingBody: boolean
  onTriggerAiSummary: () => void
  onSmartReply?: (replyText: string) => void
  onPreviewAttachment?: (att: EmailAttachment) => void
  onReply?: () => void
  onReplyAll?: () => void
  onForward?: () => void
  onDelete?: () => void
  onArchive?: () => void
}

export const ReadingPane: React.FC<ReadingPaneProps> = ({
  email,
  body,
  aiSummary,
  isLoadingBody,
  onTriggerAiSummary,
  onSmartReply,
  onPreviewAttachment,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onArchive,
}) => {
  const [quickReplyText, setQuickReplyText] = useState('')
  const [isQuickReplying, setIsQuickReplying] = useState(false)

  if (!email) {
    return (
      <div
        className="vuamail-reading"
        style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        <div style={{ marginTop: '12px', fontSize: '15px' }}>Chọn một email để đọc nội dung</div>
      </div>
    )
  }

  const initial = (email.senderName || email.senderEmail || 'U').charAt(0).toUpperCase()

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const smartReplies = [
    'Dạ em đã nhận được thông tin, sẽ xử lý ngay ạ.',
    'Cảm ơn Sếp, báo cáo rất đầy đủ và chi tiết.',
    'Em đã xem tài liệu và đồng ý với kế hoạch đề xuất.',
  ]

  const handleSendQuickReply = () => {
    if (!quickReplyText.trim()) return
    onSmartReply?.(quickReplyText)
    setQuickReplyText('')
    setIsQuickReplying(false)
  }

  return (
    <div className="vuamail-reading">
      {/* Top Reading Header with Outlook Action Buttons */}
      <div className="reading-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
          <div className="reading-subject">{email.subject || '(No subject)'}</div>

          {/* Quick Action Toolbar (Parity with GensMail & Microsoft Outlook) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={onReply}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--border, #e3e6ea)',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary, #232425)',
                cursor: 'pointer',
              }}
              title="Trả lời người gửi (Ctrl+R)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0077cd" strokeWidth="2.2">
                <polyline points="9 14 4 9 9 4" />
                <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
              </svg>
              <span>Trả lời</span>
            </button>

            <button
              type="button"
              onClick={onReplyAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--border, #e3e6ea)',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary, #232425)',
                cursor: 'pointer',
              }}
              title="Trả lời tất cả người nhận (Ctrl+Shift+R)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0077cd" strokeWidth="2.2">
                <polyline points="7 14 2 9 7 4" />
                <polyline points="13 14 8 9 13 4" />
                <path d="M22 20v-7a4 4 0 0 0-4-4H8" />
              </svg>
              <span>Tất cả</span>
            </button>

            <button
              type="button"
              onClick={onForward}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--border, #e3e6ea)',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary, #232425)',
                cursor: 'pointer',
              }}
              title="Chuyển tiếp thư (Ctrl+F)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0077cd" strokeWidth="2.2">
                <polyline points="15 14 20 9 15 4" />
                <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
              </svg>
              <span>Chuyển tiếp</span>
            </button>

            <button
              type="button"
              onClick={onArchive}
              style={{
                padding: '5px 8px',
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--border, #e3e6ea)',
                borderRadius: '5px',
                cursor: 'pointer',
                color: 'var(--text-muted, #878e96)',
              }}
              title="Lưu trữ thư"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onDelete}
              style={{
                padding: '5px 8px',
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--border, #e3e6ea)',
                borderRadius: '5px',
                cursor: 'pointer',
                color: '#d13438',
              }}
              title="Xoá thư"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        <div className="reading-meta">
          <div className="reading-avatar">{initial}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="reading-sender-name">{email.senderName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, #878e96)' }}>
                {new Date(email.dateIso).toLocaleString('vi-VN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className="reading-sender-email">
              &lt;{email.senderEmail}&gt; • Gửi tới: {email.recipientEmails.join(', ')}
            </div>
          </div>
        </div>
      </div>

      {aiSummary && (
        <div className="ai-summary-card">
          <div className="ai-summary-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            VuaOffice AI Summary
          </div>
          <div className="ai-summary-text" style={{ whiteSpace: 'pre-line' }}>{aiSummary}</div>
        </div>
      )}

      {!aiSummary && (
        <button
          className="ribbon-btn"
          style={{ width: 'fit-content', marginBottom: '16px', border: '1px solid var(--border)' }}
          onClick={onTriggerAiSummary}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0077cd" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Tóm tắt email này với VuaOffice AI
        </button>
      )}

      {isLoadingBody ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Đang nạp nội dung thư...</div>
      ) : body?.html ? (
        <div className="reading-body" dangerouslySetInnerHTML={{ __html: body.html }} />
      ) : (
        <div className="reading-body">{body?.plainText || email.snippet}</div>
      )}

      {/* Attachments Section */}
      {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
        <div className="reading-attachments">
          <div className="attachments-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            Tệp đính kèm ({email.attachments.length})
          </div>
          <div className="attachments-list">
            {email.attachments.map((att) => (
              <div key={att.id} className="attachment-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0077cd" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
                <div>
                  <div className="attachment-name">{att.filename}</div>
                  <div className="attachment-size">{formatFileSize(att.sizeBytes)}</div>
                </div>
                <button
                  className="attachment-btn"
                  onClick={() => onPreviewAttachment?.(att)}
                >
                  Xem trước
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Smart Reply Quick Suggestion Section */}
      <div className="smart-reply-bar">
        <div className="smart-reply-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0077cd" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          Gợi ý phản hồi nhanh AI (Smart Reply)
        </div>
        <div className="smart-reply-chips">
          {smartReplies.map((reply, idx) => (
            <button
              key={idx}
              className="smart-reply-chip"
              onClick={() => onSmartReply?.(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Inline Quick Reply Box (Parity with GensMail & Outlook Web) */}
      <div style={{ marginTop: '20px', borderTop: '1px solid var(--border, #e3e6ea)', paddingTop: '16px' }}>
        {!isQuickReplying ? (
          <div
            onClick={() => setIsQuickReplying(true)}
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--surface-subtle, #f6f7f9)',
              border: '1px solid var(--border, #e3e6ea)',
              borderRadius: '8px',
              color: 'var(--text-muted, #878e96)',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 14 4 9 9 4" />
                <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
              </svg>
              <span>Nhấp vào đây để trả lời <b>{email.senderName}</b>...</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onReply?.()
                }}
                style={{
                  padding: '4px 10px',
                  backgroundColor: 'var(--surface, #ffffff)',
                  border: '1px solid var(--border, #e3e6ea)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Mở khung soạn
              </button>
            </div>
          </div>
        ) : (
          <div style={{ border: '1px solid var(--vuamail-primary-blue, #0077cd)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--surface, #ffffff)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '8px 14px', backgroundColor: 'var(--surface-subtle, #f6f7f9)', borderBottom: '1px solid var(--border, #e3e6ea)', fontSize: '12px', color: 'var(--text-secondary, #606366)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Trả lời tới: <b>{email.senderEmail}</b></span>
              <button
                onClick={() => setIsQuickReplying(false)}
                style={{ border: 'none', background: 'none', color: '#878e96', cursor: 'pointer', fontSize: '14px' }}
              >
                ✕
              </button>
            </div>
            <textarea
              value={quickReplyText}
              onChange={(e) => setQuickReplyText(e.target.value)}
              placeholder="Nhập nội dung trả lời nhanh..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border, #e3e6ea)', display: 'flex', justifyContent: 'flex-end', gap: '8px', backgroundColor: 'var(--surface, #ffffff)' }}>
              <button
                type="button"
                onClick={() => setIsQuickReplying(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '5px',
                  border: '1px solid var(--border, #e3e6ea)',
                  backgroundColor: 'var(--surface, #ffffff)',
                  color: 'var(--text-primary, #232425)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSendQuickReply}
                style={{
                  padding: '6px 16px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: '#0077cd',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,119,205,0.3)',
                }}
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

