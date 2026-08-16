import React, { useState } from 'react'
import type { CalendarEvent } from '../../../../shared/types'

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: 'ev_1',
    title: 'Họp ban điều hành 360 CORP & VuaOffice Suite',
    startIso: '2026-08-16T09:00:00.000Z',
    endIso: '2026-08-16T10:30:00.000Z',
    location: 'Phòng Họp Trực Tuyến / Hội trường A',
    description: 'Rà soát tiến độ VuaMail v0.7.0 và kế hoạch ra mắt thị trường.',
    category: 'important',
  },
  {
    id: 'ev_2',
    title: 'Review kỹ thuật AI Engine & SQLite Storage',
    startIso: '2026-08-16T14:00:00.000Z',
    endIso: '2026-08-16T15:30:00.000Z',
    location: 'Hệ thống VuaHethong Meet',
    description: 'Tối ưu tốc độ truy vấn SQLite WAL và đồng bộ hàng đợi op_queue.',
    category: 'work',
  },
  {
    id: 'ev_3',
    title: 'Gặp gỡ đối tác khách hàng Doanh nghiệp',
    startIso: '2026-08-17T10:00:00.000Z',
    endIso: '2026-08-17T11:30:00.000Z',
    location: 'Trụ sở 360 CORP',
    description: 'Trình diễn tính năng Offline Mail Client & AI Smart Summary.',
    category: 'personal',
  },
  {
    id: 'ev_4',
    title: 'Kiểm thử đồng bộ Op-Queue & Attachment Viewer',
    startIso: '2026-08-18T15:00:00.000Z',
    endIso: '2026-08-18T16:30:00.000Z',
    location: 'Văn phòng R&D',
    description: 'Kiểm tra mở tài liệu DOCX/PDF/XLSX đính kèm trực tiếp trong VuaOffice.',
    category: 'work',
  },
]

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 08:00 to 20:00

export const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(DEMO_EVENTS)
  const [selectedEventId, setSelectedEventId] = useState<string>(DEMO_EVENTS[0].id)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 16)) // Aug 16, 2026

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null

  const handlePrev = () => {
    const d = new Date(currentDate)
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1)
    else if (viewMode === 'week') d.setDate(d.getDate() - 7)
    else d.setDate(d.getDate() - 1)
    setCurrentDate(d)
  }

  const handleNext = () => {
    const d = new Date(currentDate)
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1)
    else if (viewMode === 'week') d.setDate(d.getDate() + 7)
    else d.setDate(d.getDate() + 1)
    setCurrentDate(d)
  }

  const handleToday = () => {
    setCurrentDate(new Date(2026, 7, 16))
  }

  const handleAddEvent = () => {
    const newTitle = prompt('Nhập tiêu đề sự kiện mới:')
    if (!newTitle) return
    const newEv: CalendarEvent = {
      id: `ev_${Date.now()}`,
      title: newTitle,
      startIso: new Date(currentDate.getTime() + 1000 * 60 * 60 * 2).toISOString(),
      endIso: new Date(currentDate.getTime() + 1000 * 60 * 60 * 3).toISOString(),
      location: 'Văn phòng 360 CORP',
      description: 'Sự kiện tạo từ VuaMail Calendar',
      category: 'work',
    }
    setEvents((prev) => [newEv, ...prev])
    setSelectedEventId(newEv.id)
  }

  // Calculate start of current week (Monday)
  const getWeekDays = () => {
    const d = new Date(currentDate)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const monday = new Date(d.setDate(diff))
    return Array.from({ length: 7 }, (_, i) => {
      const wDay = new Date(monday)
      wDay.setDate(monday.getDate() + i)
      return wDay
    })
  }

  const weekDays = getWeekDays()

  const formattedMonthYear = `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0, height: '100%', overflow: 'hidden', backgroundColor: 'var(--surface, #ffffff)' }}>
      {/* Calendar Sidebar */}
      <div
        style={{
          width: '210px',
          borderRight: '1px solid var(--border, #e3e6ea)',
          backgroundColor: 'var(--surface-subtle, #f6f7f9)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
          gap: '14px',
          flexShrink: 0,
          overflowY: 'auto',
        }}
      >
        <button
          style={{
            backgroundColor: '#0078d4',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '9px 12px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,120,212,0.2)',
          }}
          onClick={handleAddEvent}
        >
          ➕ Sự kiện mới
        </button>

        <div style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #878e96)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
            Lịch của tôi
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary, #232425)', cursor: 'pointer', marginBottom: '8px' }}>
            <input type="checkbox" defaultChecked />
            <span>Lịch công tác VuaOffice</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary, #232425)', cursor: 'pointer', marginBottom: '8px' }}>
            <input type="checkbox" defaultChecked />
            <span>Họp ban quản trị 360 CORP</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary, #232425)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            <span>Sinh nhật & Ngày lễ</span>
          </label>
        </div>

        <div style={{ borderTop: '1px solid var(--border, #e3e6ea)', paddingTop: '14px', marginTop: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #878e96)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Phân loại màu sắc
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary, #606366)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#d13438' }} />
              <span>Khẩn cấp / Quan trọng</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#0078d4' }} />
              <span>Công việc / Họp dự án</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#107c41' }} />
              <span>Cá nhân / Đối tác</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Board */}
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface, #ffffff)', overflow: 'hidden' }}>
        {/* Calendar Header / Toolbar */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border, #e3e6ea)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface, #ffffff)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>
              {formattedMonthYear}
            </h2>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={handlePrev}
                style={{ padding: '4px 8px', border: '1px solid var(--border, #e3e6ea)', background: 'var(--surface, #ffffff)', color: 'var(--text-primary, #232425)', borderRadius: '4px', cursor: 'pointer' }}
              >
                ◀
              </button>
              <button
                onClick={handleToday}
                style={{ padding: '4px 10px', border: '1px solid var(--border, #e3e6ea)', background: 'var(--surface, #ffffff)', color: 'var(--text-primary, #232425)', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '12px' }}
              >
                Hôm nay
              </button>
              <button
                onClick={handleNext}
                style={{ padding: '4px 8px', border: '1px solid var(--border, #e3e6ea)', background: 'var(--surface, #ffffff)', color: 'var(--text-primary, #232425)', borderRadius: '4px', cursor: 'pointer' }}
              >
                ▶
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-subtle, #f6f7f9)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border, #e3e6ea)' }}>
            <button
              onClick={() => setViewMode('month')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'month' ? '#0078d4' : 'transparent',
                color: viewMode === 'month' ? '#ffffff' : 'var(--text-primary, #232425)',
                fontWeight: viewMode === 'month' ? 600 : 500,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Tháng
            </button>
            <button
              onClick={() => setViewMode('week')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'week' ? '#0078d4' : 'transparent',
                color: viewMode === 'week' ? '#ffffff' : 'var(--text-primary, #232425)',
                fontWeight: viewMode === 'week' ? 600 : 500,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode('day')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'day' ? '#0078d4' : 'transparent',
                color: viewMode === 'day' ? '#ffffff' : 'var(--text-primary, #232425)',
                fontWeight: viewMode === 'day' ? 600 : 500,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Ngày
            </button>
          </div>
        </div>

        {/* Dynamic View Content */}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
          {/* Calendar Grid / Schedule Area */}
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: 'var(--surface, #ffffff)' }}>
            {/* 1. MONTH VIEW */}
            {viewMode === 'month' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', minHeight: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: 'var(--text-muted, #878e96)' }}>
                  <div>Th 2</div>
                  <div>Th 3</div>
                  <div>Th 4</div>
                  <div>Th 5</div>
                  <div>Th 6</div>
                  <div style={{ color: '#0078d4' }}>Th 7</div>
                  <div style={{ color: '#e11d48' }}>CN</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(80px, 1fr)', gap: '6px', flex: 1 }}>
                  {Array.from({ length: 31 }).map((_, i) => {
                    const dayNum = i + 1
                    const dayEvents = events.filter((e) => new Date(e.startIso).getDate() === dayNum)
                    const isToday = dayNum === 16

                    return (
                      <div
                        key={i}
                        style={{
                          border: isToday ? '2px solid #0078d4' : '1px solid var(--border, #e3e6ea)',
                          borderRadius: '6px',
                          padding: '6px',
                          backgroundColor: isToday ? 'var(--surface-subtle, #f6f7f9)' : 'var(--surface, #ffffff)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: isToday ? 700 : 500, color: isToday ? '#0078d4' : 'var(--text-primary, #232425)' }}>
                            {dayNum}
                          </span>
                          {isToday && (
                            <span style={{ fontSize: '9px', fontWeight: 700, backgroundColor: '#0078d4', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>
                              Hôm nay
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', flex: 1 }}>
                          {dayEvents.map((ev) => (
                            <div
                              key={ev.id}
                              onClick={() => setSelectedEventId(ev.id)}
                              style={{
                                backgroundColor: ev.category === 'important' ? '#d13438' : ev.category === 'personal' ? '#107c41' : '#0078d4',
                                color: '#fff',
                                fontSize: '11px',
                                padding: '2px 4px',
                                borderRadius: '3px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                cursor: 'pointer',
                                fontWeight: selectedEventId === ev.id ? 700 : 400,
                              }}
                              title={`${ev.title} (${new Date(ev.startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                            >
                              {new Date(ev.startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {ev.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 2. WEEK VIEW */}
            {viewMode === 'week' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', minHeight: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', borderBottom: '1px solid var(--border, #e3e6ea)', paddingBottom: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #878e96)', textAlign: 'center' }}>Giờ</div>
                  {weekDays.map((wDay, idx) => {
                    const isToday = wDay.getDate() === 16
                    return (
                      <div key={idx} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)' }}>Th {idx + 2 > 7 ? 'CN' : idx + 2}</div>
                        <div style={{ fontSize: '13px', fontWeight: isToday ? 700 : 600, color: isToday ? '#0078d4' : 'var(--text-primary, #232425)' }}>
                          {wDay.getDate()}/{wDay.getMonth() + 1} {isToday && '•'}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {HOURS.map((hour) => (
                    <div key={hour} style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', minHeight: '48px', borderBottom: '1px solid var(--border-subtle, #efefef)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', textAlign: 'center', paddingTop: '4px' }}>
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                      {weekDays.map((wDay, dayIdx) => {
                        const dayEvents = events.filter((e) => {
                          const evDate = new Date(e.startIso)
                          return evDate.getDate() === wDay.getDate() && evDate.getHours() === hour
                        })

                        return (
                          <div key={dayIdx} style={{ borderLeft: '1px solid var(--border, #e3e6ea)', padding: '2px 4px', position: 'relative' }}>
                            {dayEvents.map((ev) => (
                              <div
                                key={ev.id}
                                onClick={() => setSelectedEventId(ev.id)}
                                style={{
                                  backgroundColor: ev.category === 'important' ? '#d13438' : '#0078d4',
                                  color: '#fff',
                                  borderRadius: '4px',
                                  padding: '3px 5px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  marginBottom: '2px',
                                }}
                              >
                                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                                <div style={{ fontSize: '9px', opacity: 0.9 }}>📍 {ev.location}</div>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DAY VIEW */}
            {viewMode === 'day' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', minHeight: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', borderBottom: '1px solid var(--border, #e3e6ea)', paddingBottom: '8px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#0078d4' }}>
                    {currentDate.getDate()}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>
                      Thứ {currentDate.getDay() === 0 ? 'Chủ Nhật' : currentDate.getDay() + 1}, {currentDate.toLocaleDateString('vi-VN')}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted, #878e96)' }}>
                      Có {events.filter((e) => new Date(e.startIso).getDate() === currentDate.getDate()).length} sự kiện được lên lịch
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {HOURS.map((hour) => {
                    const hourEvents = events.filter((e) => {
                      const evDate = new Date(e.startIso)
                      return evDate.getDate() === currentDate.getDate() && evDate.getHours() === hour
                    })

                    return (
                      <div key={hour} style={{ display: 'flex', gap: '12px', minHeight: '56px', borderBottom: '1px solid var(--border-subtle, #efefef)', padding: '4px 0' }}>
                        <div style={{ width: '50px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #878e96)', textAlign: 'right' }}>
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        <div style={{ flex: 1, borderLeft: '2px solid #0078d4', paddingLeft: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {hourEvents.length > 0 ? (
                            hourEvents.map((ev) => (
                              <div
                                key={ev.id}
                                onClick={() => setSelectedEventId(ev.id)}
                                style={{
                                  backgroundColor: selectedEventId === ev.id ? 'var(--hover, #f5f5f5)' : 'var(--surface-subtle, #f6f7f9)',
                                  border: '1px solid var(--border, #e3e6ea)',
                                  borderLeft: `4px solid ${ev.category === 'important' ? '#d13438' : '#0078d4'}`,
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary, #232425)' }}>{ev.title}</span>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted, #878e96)' }}>
                                    🕒 {new Date(ev.startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.endIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #606366)', marginTop: '2px' }}>📍 {ev.location}</div>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', fontStyle: 'italic', paddingTop: '2px' }}>
                              (Trống lịch)
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Detail Pane */}
          <div
            style={{
              width: '280px',
              borderLeft: '1px solid var(--border, #e3e6ea)',
              padding: '16px 14px',
              backgroundColor: 'var(--surface-subtle, #f6f7f9)',
              overflowY: 'auto',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #232425)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sự kiện sắp diễn ra
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #e3e6ea)',
                      backgroundColor: selectedEventId === ev.id ? 'var(--hover, #f5f5f5)' : 'var(--surface, #ffffff)',
                      borderLeft: `3px solid ${selectedEventId === ev.id ? '#0078d4' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary, #232425)', marginBottom: '3px' }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted, #878e96)' }}>
                      📅 {new Date(ev.startIso).toLocaleDateString('vi-VN')} • {new Date(ev.startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted, #878e96)', marginTop: '2px' }}>
                      📍 {ev.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedEvent && (
              <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e3e6ea)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary, #232425)', marginBottom: '6px' }}>
                  Chi tiết sự kiện:
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0078d4', marginBottom: '4px' }}>
                  {selectedEvent.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', marginBottom: '8px' }}>
                  🕒 {new Date(selectedEvent.startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedEvent.endIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br/>
                  📍 {selectedEvent.location}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary, #606366)', margin: 0, lineHeight: '1.5', borderTop: '1px solid var(--border-subtle, #efefef)', paddingTop: '6px' }}>
                  {selectedEvent.description || 'Không có ghi chú thêm.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
