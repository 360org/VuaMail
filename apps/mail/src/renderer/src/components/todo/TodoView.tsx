import React, { useState } from 'react'

export interface MailTask {
  id: string
  title: string
  dueDate?: string
  priority: 'high' | 'normal' | 'low'
  isCompleted: boolean
  category: 'work' | 'personal' | 'important'
  notes?: string
}

const INITIAL_TASKS: MailTask[] = [
  {
    id: 'task_1',
    title: 'Kiểm tra & duyệt bản phát hành VuaOffice Suite v0.6.6',
    dueDate: '2026-08-16',
    priority: 'high',
    isCompleted: false,
    category: 'important',
    notes: 'Rà soát tính tương thích của SQLite Mail Engine và giao diện Fluent UI 3 cột.',
  },
  {
    id: 'task_2',
    title: 'Chuẩn bị tài liệu hướng dẫn sử dụng tính năng Import/Export .pst',
    dueDate: '2026-08-18',
    priority: 'normal',
    isCompleted: false,
    category: 'work',
    notes: 'Tài liệu hướng dẫn PO & Khách hàng chuyển đổi dữ liệu từ Microsoft Outlook sang VuaMail.',
  },
  {
    id: 'task_3',
    title: 'Tối ưu hoá hiệu năng truy vấn danh bạ People & Lịch Calendar',
    dueDate: '2026-08-20',
    priority: 'normal',
    isCompleted: true,
    category: 'work',
    notes: 'Đã hoàn thành cấu trúc dữ liệu và tích hợp vào AppRail của VuaMail.',
  },
  {
    id: 'task_4',
    title: 'Họp rà soát quy trình bảo mật và mã hoá CSDL Cục bộ',
    dueDate: '2026-08-22',
    priority: 'low',
    isCompleted: false,
    category: 'personal',
    notes: 'Trao đổi với đội ngũ kỹ thuật 360 CORP về kế hoạch nâng cấp.',
  },
]

export const TodoView: React.FC = () => {
  const [tasks, setTasks] = useState<MailTask[]>(INITIAL_TASKS)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(INITIAL_TASKS[0].id)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'important'>('all')
  const [newTitle, setNewTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending' && t.isCompleted) return false
    if (filter === 'completed' && !t.isCompleted) return false
    if (filter === 'important' && t.priority !== 'high' && t.category !== 'important') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))
    }
    return true
  })

  const handleToggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    )
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const newTask: MailTask = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'normal',
      isCompleted: false,
      category: 'work',
      notes: '',
    }
    setTasks((prev) => [newTask, ...prev])
    setSelectedTaskId(newTask.id)
    setNewTitle('')
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (selectedTaskId === id) {
      setSelectedTaskId(null)
    }
  }

  const handleUpdateNotes = (notes: string) => {
    if (!selectedTaskId) return
    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTaskId ? { ...t, notes } : t))
    )
  }

  const handleTogglePriority = () => {
    if (!selectedTaskId) return
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTaskId
          ? { ...t, priority: t.priority === 'high' ? 'normal' : 'high' }
          : t
      )
    )
  }

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden', backgroundColor: 'var(--surface, #ffffff)' }}>
      {/* Category Sidebar */}
      <div
        style={{
          width: '230px',
          borderRight: '1px solid var(--border, #e3e6ea)',
          backgroundColor: 'var(--surface-subtle, #f6f7f9)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 10px',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted, #878e96)',
            padding: '4px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          To Do & Danh mục
        </div>

        <div
          onClick={() => setFilter('all')}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: filter === 'all' ? 'var(--hover, #e8f2fc)' : 'transparent',
            color: filter === 'all' ? '#0078d4' : 'var(--text-primary, #232425)',
            fontWeight: filter === 'all' ? 600 : 400,
          }}
        >
          <span>📋 Tất cả công việc</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>{tasks.length}</span>
        </div>

        <div
          onClick={() => setFilter('important')}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: filter === 'important' ? 'var(--hover, #e8f2fc)' : 'transparent',
            color: filter === 'important' ? '#0078d4' : 'var(--text-primary, #232425)',
            fontWeight: filter === 'important' ? 600 : 400,
          }}
        >
          <span>⭐ Quan trọng & Khẩn</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>
            {tasks.filter((t) => t.priority === 'high' || t.category === 'important').length}
          </span>
        </div>

        <div
          onClick={() => setFilter('pending')}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: filter === 'pending' ? 'var(--hover, #e8f2fc)' : 'transparent',
            color: filter === 'pending' ? '#0078d4' : 'var(--text-primary, #232425)',
            fontWeight: filter === 'pending' ? 600 : 400,
          }}
        >
          <span>⏳ Đang thực hiện</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>
            {tasks.filter((t) => !t.isCompleted).length}
          </span>
        </div>

        <div
          onClick={() => setFilter('completed')}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: filter === 'completed' ? 'var(--hover, #e8f2fc)' : 'transparent',
            color: filter === 'completed' ? '#0078d4' : 'var(--text-primary, #232425)',
            fontWeight: filter === 'completed' ? 600 : 400,
          }}
        >
          <span>✅ Đã hoàn thành</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>
            {tasks.filter((t) => t.isCompleted).length}
          </span>
        </div>
      </div>

      {/* Task List Column (Fluid Resizable) */}
      <div
        style={{
          width: '360px',
          minWidth: '280px',
          borderRight: '1px solid var(--border, #e3e6ea)',
          backgroundColor: 'var(--surface, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Add Task Input Form */}
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border, #e3e6ea)', backgroundColor: 'var(--surface, #ffffff)' }}>
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="+ Thêm công việc mới (Nhấn Enter)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border, #e3e6ea)',
                background: 'var(--surface-subtle, #f6f7f9)',
                color: 'var(--text-primary, #232425)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              style={{
                backgroundColor: newTitle.trim() ? '#0078d4' : 'var(--surface-subtle, #f6f7f9)',
                color: newTitle.trim() ? '#fff' : 'var(--text-muted, #878e96)',
                border: 'none',
                borderRadius: '4px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: newTitle.trim() ? 'pointer' : 'default',
              }}
            >
              Thêm
            </button>
          </form>
        </div>

        {/* Search inside tasks */}
        <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-subtle, #efefef)' }}>
          <input
            type="text"
            placeholder="Lọc danh sách công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid var(--border, #e3e6ea)',
              background: 'var(--surface, #ffffff)',
              color: 'var(--text-primary, #232425)',
              fontSize: '11px',
              outline: 'none',
            }}
          />
        </div>

        {/* Task Items List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted, #878e96)', fontSize: '13px' }}>
              Không có công việc nào trong mục này
            </div>
          ) : (
            filteredTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTaskId(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-subtle, #efefef)',
                  backgroundColor: selectedTaskId === t.id ? 'var(--hover, #e8f2fc)' : 'transparent',
                  borderLeft: selectedTaskId === t.id ? '3px solid #0078d4' : '3px solid transparent',
                  transition: 'background 0.1s ease',
                }}
              >
                <input
                  type="checkbox"
                  checked={t.isCompleted}
                  onClick={(e) => handleToggleComplete(t.id, e)}
                  onChange={() => {}}
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: t.isCompleted ? 400 : 600,
                      color: t.isCompleted ? 'var(--text-muted, #878e96)' : 'var(--text-primary, #232425)',
                      textDecoration: t.isCompleted ? 'line-through' : 'none',
                      lineHeight: '1.4',
                      wordBreak: 'break-word',
                    }}
                  >
                    {t.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted, #878e96)' }}>
                    {t.dueDate && <span>📅 {t.dueDate}</span>}
                    {t.priority === 'high' && (
                      <span style={{ color: '#d13438', fontWeight: 600 }}>🔥 Khẩn cấp</span>
                    )}
                    {t.notes && <span>📝 Có ghi chú</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task Details Pane (Responsive 100% Fluid Width) */}
      <div style={{ flex: 1, backgroundColor: 'var(--surface, #ffffff)', padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {selectedTask ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--border, #e3e6ea)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={selectedTask.isCompleted}
                  onClick={(e) => handleToggleComplete(selectedTask.id, e)}
                  onChange={() => {}}
                  style={{ marginTop: '6px', width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: 'var(--text-primary, #232425)',
                      textDecoration: selectedTask.isCompleted ? 'line-through' : 'none',
                      lineHeight: '1.4',
                    }}
                  >
                    {selectedTask.title}
                  </h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted, #878e96)' }}>
                    Hạn chót: <span style={{ fontWeight: 500, color: 'var(--text-primary, #232425)' }}>{selectedTask.dueDate || 'Chưa đặt ngày'}</span> • Trạng thái:{' '}
                    <span style={{ fontWeight: 600, color: selectedTask.isCompleted ? '#107c41' : '#0078d4' }}>
                      {selectedTask.isCompleted ? 'Đã hoàn tất' : 'Đang xử lý'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={handleTogglePriority}
                  style={{
                    background: selectedTask.priority === 'high' ? 'rgba(209,52,56,0.1)' : 'transparent',
                    border: '1px solid var(--border, #e3e6ea)',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: selectedTask.priority === 'high' ? '#d13438' : 'var(--text-primary, #232425)',
                    fontWeight: 600,
                  }}
                >
                  {selectedTask.priority === 'high' ? '★ Khẩn cấp' : '☆ Đánh dấu khẩn'}
                </button>
                <button
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border, #e3e6ea)',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: '#d13438',
                    fontWeight: 500,
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>

            {/* Notes Section Responsive Full Width */}
            <div
              style={{
                backgroundColor: 'var(--surface-subtle, #f6f7f9)',
                borderRadius: '8px',
                padding: '18px 20px',
                border: '1px solid var(--border, #e3e6ea)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>
                Chi tiết & Ghi chú công việc:
              </div>
              <textarea
                rows={10}
                value={selectedTask.notes || ''}
                onChange={(e) => handleUpdateNotes(e.target.value)}
                placeholder="Nhập ghi chú chi tiết cho công việc này..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border, #e3e6ea)',
                  backgroundColor: 'var(--surface, #ffffff)',
                  color: 'var(--text-primary, #232425)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted, #878e96)' }}>
            Chọn một công việc từ danh sách để xem chi tiết
          </div>
        )}
      </div>
    </div>
  )
}
