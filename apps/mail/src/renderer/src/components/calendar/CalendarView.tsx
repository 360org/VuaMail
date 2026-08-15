import React, { useState } from 'react'
import type { CalendarEvent } from '../../../../shared/types'

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: 'ev_1',
    title: 'Họp ban điều hành 360 CORP & VuaOffice Suite',
    startIso: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    endIso: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    location: 'Phòng Họp Trực Tuyến / Hội trường A',
    description: 'Rà soát tiến độ VuaMail v0.7.0 và kế hoạch ra mắt thị trường.',
    category: 'important',
  },
  {
    id: 'ev_2',
    title: 'Review kỹ thuật AI Engine & SQLite Storage',
    startIso: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    endIso: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(),
    location: 'Hệ thống VuaHethong Meet',
    description: 'Tối ưu tốc độ truy vấn SQLite WAL và đồng bộ hàng đợi op_queue.',
    category: 'work',
  },
  {
    id: 'ev_3',
    title: 'Gặp gỡ đối tác khách hàng Doanh nghiệp',
    startIso: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    endIso: new Date(Date.now() + 1000 * 60 * 60 * 50).toISOString(),
    location: 'Trụ sở 360 CORP',
    description: 'Trình diễn tính năng Offline Mail Client & AI Smart Summary.',
    category: 'personal',
  }
]

export const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(DEMO_EVENTS)
  const [selectedEventId, setSelectedEventId] = useState<string>(DEMO_EVENTS[0].id)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
      {/* Calendar Sidebar */}
      <div
        style={{
          width: '240px',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--surface-subtle)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
          gap: '12px',
        }}
      >
        <button
          style={{
            backgroundColor: '#0078d4',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onClick={() => {
            const newTitle = prompt('Nhập tiêu đề sự kiện mới:')
            if (!newTitle) return
            const newEv: CalendarEvent = {
              id: `ev_${Date.now()}`,
              title: newTitle,
              startIso: new Date().toISOString(),
              endIso: new Date(Date.now() + 3600000).toISOString(),
              location: 'Văn phòng',
              description: 'Sự kiện tạo từ VuaMail Calendar',
              category: 'work',
            }
            setEvents((prev) => [newEv, ...prev])
            setSelectedEventId(newEv.id)
          }}
        >
          ➕ Sự kiện mới (New Event)
        </button>

        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Lịch của tôi (My Calendars)
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '6px' }}>
            <input type="checkbox" defaultChecked />
            <span>Lịch công tác VuaOffice</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '6px' }}>
            <input type="checkbox" defaultChecked />
            <span>Họp ban quản trị 360 CORP</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            <span>Sinh nhật & Ngày lễ</span>
          </label>
        </div>
      </div>

      {/* Main Calendar Board */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
        {/* Calendar Header / Toolbar */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
              Tháng 8, 2026
            </h2>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={{ padding: '4px 8px', border: '1px solid var(--border)', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>◀</button>
              <button style={{ padding: '4px 8px', border: '1px solid var(--border)', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>Hôm nay</button>
              <button style={{ padding: '4px 8px', border: '1px solid var(--border)', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>▶</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setViewMode('month')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: viewMode === 'month' ? 'var(--hover)' : 'transparent',
                fontWeight: viewMode === 'month' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              Tháng
            </button>
            <button
              onClick={() => setViewMode('week')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: viewMode === 'week' ? 'var(--hover)' : 'transparent',
                fontWeight: viewMode === 'week' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode('day')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: viewMode === 'day' ? 'var(--hover)' : 'transparent',
                fontWeight: viewMode === 'day' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              Ngày
            </button>
          </div>
        </div>

        {/* Calendar Content & Events List */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px', fontWeight: 600, fontSize: '12px', color: 'var(--text-muted)' }}>
              <div>Th 2</div>
              <div>Th 3</div>
              <div>Th 4</div>
              <div>Th 5</div>
              <div>Th 6</div>
              <div style={{ color: '#0078d4' }}>Th 7</div>
              <div style={{ color: '#e11d48' }}>CN</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minHeight: '380px' }}>
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1
                const hasEvent = events.some((e) => new Date(e.startIso).getDate() === dayNum)
                const isToday = dayNum === 15

                return (
                  <div
                    key={i}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '6px',
                      minHeight: '70px',
                      backgroundColor: isToday ? 'var(--surface-subtle)' : 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: isToday ? 700 : 500, color: isToday ? '#0078d4' : 'var(--text)' }}>
                      {dayNum} {isToday && '(Hôm nay)'}
                    </div>

                    {hasEvent && (
                      <div
                        style={{
                          backgroundColor: '#0078d4',
                          color: '#fff',
                          fontSize: '10px',
                          padding: '2px 4px',
                          borderRadius: '3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                        }}
                      >
                        📅 Sự kiện ({events.filter((e) => new Date(e.startIso).getDate() === dayNum).length})
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Side Details of Events */}
          <div
            style={{
              width: '300px',
              borderLeft: '1px solid var(--border)',
              padding: '16px',
              backgroundColor: 'var(--surface-subtle)',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Sự kiện sắp diễn ra</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: selectedEventId === ev.id ? 'var(--hover)' : 'var(--surface)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)', marginBottom: '4px' }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    🕒 {new Date(ev.startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(ev.endIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    📍 {ev.location}
                  </div>
                </div>
              ))}
            </div>

            {selectedEvent && (
              <div style={{ marginTop: '20px', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Chi tiết sự kiện:</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  {selectedEvent.description || 'Không có mô tả thêm.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
