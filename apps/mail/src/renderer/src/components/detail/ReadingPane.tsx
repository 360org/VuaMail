import React from 'react'
import type { EmailAttachment, EmailBody, EmailMessage } from '../../../../shared/types'

interface ReadingPaneProps {
  email: EmailMessage | null
  body: EmailBody | null
  aiSummary: string | null
  isLoadingBody: boolean
  onTriggerAiSummary: () => void
  onSmartReply?: (replyText: string) => void
  onPreviewAttachment?: (att: EmailAttachment) => void
}

export const ReadingPane: React.FC<ReadingPaneProps> = ({
  email,
  body,
  aiSummary,
  isLoadingBody,
  onTriggerAiSummary,
  onSmartReply,
  onPreviewAttachment,
}) => {
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
        <div style={{ marginTop: '12px', fontSize: '15px' }}>Select an email to read</div>
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

  return (
    <div className="vuamail-reading">
      <div className="reading-header">
        <div className="reading-subject">{email.subject || '(No subject)'}</div>
        <div className="reading-meta">
          <div className="reading-avatar">{initial}</div>
          <div>
            <div className="reading-sender-name">{email.senderName}</div>
            <div className="reading-sender-email">
              &lt;{email.senderEmail}&gt; • To: {email.recipientEmails.join(', ')}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0078d4" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Tóm tắt email này với VuaOffice AI
        </button>
      )}

      {isLoadingBody ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading content...</div>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0078d4" strokeWidth="2">
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

      {/* AI Smart Reply Section */}
      <div className="smart-reply-bar">
        <div className="smart-reply-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0078d4" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          Phản hồi nhanh AI (Smart Reply)
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
    </div>
  )
}
