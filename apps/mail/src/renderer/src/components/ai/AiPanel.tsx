import React, { useState } from 'react'
import type { EmailMessage } from '../../../../shared/types'

interface AiPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedEmail: EmailMessage | null
  onApplyReply: (replyText: string) => void
  onCreateTask: (taskTitle: string) => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export const AiPanel: React.FC<AiPanelProps> = ({
  isOpen,
  onClose,
  selectedEmail,
  onApplyReply,
  onCreateTask,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_welcome',
      role: 'assistant',
      content:
        'Xin chào Sếp! Em là VuaOffice AI Mail Agent. Em có thể giúp Sếp tóm tắt nội dung email, soạn thư trả lời chuyên nghiệp, trích xuất việc cần làm (To-Do) hoặc lên lịch họp Calendar.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery
    if (!query.trim()) return

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputQuery('')
    setIsProcessing(true)

    // Simulate AI Copilot response tailored to context
    setTimeout(() => {
      let responseContent = ''
      const q = query.toLowerCase()

      if (q.includes('tóm tắt') || q.includes('summary')) {
        responseContent = selectedEmail
          ? `📌 **Tóm tắt nội dung email "${selectedEmail.subject}":**\n\n• **Người gửi:** ${selectedEmail.senderName} (${selectedEmail.senderEmail})\n• **Nội dung chính:** ${selectedEmail.snippet}\n• **Hành động đề xuất:** Cần xác nhận phản hồi và kiểm tra tệp đính kèm liên quan.`
          : 'Sếp vui lòng chọn một email từ danh sách để em phân tích và tóm tắt chi tiết.'
      } else if (q.includes('trả lời') || q.includes('soạn') || q.includes('reply')) {
        const replyDraft =
          'Kính gửi đối tác / Sếp,\n\nEm đã nhận được thông tin và kiểm tra tài liệu. Chúng em sẽ triển khai theo đúng tiến độ kế hoạch đã đề ra.\n\nTrân trọng,\nChâu Lê - 360 CORP'
        responseContent = `✍️ **Bản thảo gợi ý phản hồi:**\n\n${replyDraft}\n\n👉 *Bấm nút "Áp dụng vào thư" bên dưới để đưa vào hộp soạn thư.*`
      } else if (q.includes('task') || q.includes('việc') || q.includes('todo')) {
        responseContent =
          '✅ Em đã trích xuất 02 đầu việc từ email này:\n1. Rà soát tài liệu đính kèm VuaOffice Suite.\n2. Phản hồi xác nhận trước 17:00 hôm nay.'
      } else {
        responseContent = `Dạ em đã hiểu yêu cầu "${query}". Em đang kết nối với VuaOffice AI Gateway và Hermes LLM để xử lý cho Sếp.`
      }

      const aiMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, aiMsg])
      setIsProcessing(false)
    }, 600)
  }

  return (
    <div
      style={{
        width: '340px',
        minWidth: '300px',
        borderLeft: '1px solid var(--border, #e3e6ea)',
        backgroundColor: 'var(--surface, #ffffff)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        zIndex: 5,
      }}
    >
      {/* AI Panel Header */}
      <div
        style={{
          height: '44px',
          borderBottom: '1px solid var(--border, #e3e6ea)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          backgroundColor: 'var(--surface-subtle, #f6f7f9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary, #232425)' }}>
          <span style={{ color: '#0078d4', fontSize: '16px' }}>✨</span>
          <span>VuaOffice AI Agent</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setMessages([messages[0]])}
            title="Làm mới đoạn chat"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', color: 'var(--text-muted, #878e96)', fontSize: '13px' }}
          >
            🔄
          </button>
          <button
            onClick={onClose}
            title="Đóng bảng AI"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', color: 'var(--text-muted, #878e96)', fontSize: '14px', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Selected Context Chip */}
      {selectedEmail && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--surface-subtle, #f6f7f9)',
            borderBottom: '1px solid var(--border-subtle, #efefef)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--text-secondary, #606366)',
          }}
        >
          <span style={{ fontSize: '12px' }}>✉️</span>
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
            {selectedEmail.subject || '(Không có tiêu đề)'}
          </span>
          <span style={{ fontSize: '9px', backgroundColor: '#0078d4', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>
            Context
          </span>
        </div>
      )}

      {/* Chat Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%',
            }}
          >
            <div
              style={{
                backgroundColor: m.role === 'user' ? '#0078d4' : 'var(--surface-subtle, #f6f7f9)',
                color: m.role === 'user' ? '#ffffff' : 'var(--text-primary, #232425)',
                padding: '10px 12px',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                fontSize: '12px',
                lineHeight: '1.5',
                border: m.role === 'user' ? 'none' : '1px solid var(--border, #e3e6ea)',
                whiteSpace: 'pre-line',
              }}
            >
              {m.content}
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text-muted, #878e96)', marginTop: '2px', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.timestamp}
            </span>
          </div>
        ))}

        {isProcessing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted, #878e96)', padding: '6px 0' }}>
            <span style={{ animation: 'spin 1s infinite linear' }}>⏳</span> VuaOffice AI đang xử lý...
          </div>
        )}
      </div>

      {/* Quick Action Pills */}
      <div style={{ padding: '8px 12px', display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '1px solid var(--border-subtle, #efefef)' }}>
        <button
          onClick={() => handleSend('Tóm tắt email này cho anh')}
          style={{
            whiteSpace: 'nowrap',
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid var(--border, #e3e6ea)',
            backgroundColor: 'var(--surface, #ffffff)',
            color: 'var(--text-primary, #232425)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          📌 Tóm tắt email
        </button>
        <button
          onClick={() => handleSend('Soạn thư trả lời đồng ý và cảm ơn')}
          style={{
            whiteSpace: 'nowrap',
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid var(--border, #e3e6ea)',
            backgroundColor: 'var(--surface, #ffffff)',
            color: 'var(--text-primary, #232425)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          ✍️ Soạn trả lời
        </button>
        <button
          onClick={() => handleSend('Trích xuất việc cần làm vào To-Do')}
          style={{
            whiteSpace: 'nowrap',
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid var(--border, #e3e6ea)',
            backgroundColor: 'var(--surface, #ffffff)',
            color: 'var(--text-primary, #232425)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          📋 Tạo To-Do
        </button>
      </div>

      {/* Chat Input Bar */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border, #e3e6ea)', backgroundColor: 'var(--surface-subtle, #f6f7f9)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <input
            type="text"
            placeholder="Hỏi VuaOffice AI Agent..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '20px',
              border: '1px solid var(--border, #e3e6ea)',
              backgroundColor: 'var(--surface, #ffffff)',
              color: 'var(--text-primary, #232425)',
              fontSize: '12px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: inputQuery.trim() ? '#0078d4' : 'var(--border, #e3e6ea)',
              color: '#ffffff',
              border: 'none',
              cursor: inputQuery.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  )
}
