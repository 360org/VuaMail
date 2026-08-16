import React, { useState } from 'react'
import type { ContactInfo } from '../../../../shared/types'

const DEMO_CONTACTS: ContactInfo[] = [
  {
    id: 'c_1',
    name: 'Alice Johnson',
    email: 'alice.johnson@360.org.vn',
    jobTitle: 'Trưởng phòng Kỹ thuật',
    department: 'Software Engineering',
    company: '360 CORP',
    phone: '+84 901 234 567',
    isFavorite: true,
  },
  {
    id: 'c_2',
    name: 'Bob Smith',
    email: 'bob.smith@vuahethong.com',
    jobTitle: 'Kiến trúc sư Giải pháp',
    department: 'Cloud Infrastructure',
    company: 'Vua Hệ Thống',
    phone: '+84 908 987 654',
    isFavorite: true,
  },
  {
    id: 'c_3',
    name: 'Charlie Brown',
    email: 'charlie.brown@360.org.vn',
    jobTitle: 'Chuyên viên AI / MLOps',
    department: 'AI Lab',
    company: '360 CORP',
    phone: '+84 912 345 678',
    isFavorite: false,
  },
  {
    id: 'c_4',
    name: 'Diana Miller',
    email: 'diana.miller@vuahethong.com',
    jobTitle: 'Giám đốc Sản phẩm',
    department: 'Product Management',
    company: 'Vua Hệ Thống',
    phone: '+84 933 654 321',
    isFavorite: false,
  },
  {
    id: 'c_5',
    name: 'Ethan Clark',
    email: 'ethan.clark@360.org.vn',
    jobTitle: 'DevOps & SRE Specialist',
    department: 'Infrastructure',
    company: '360 CORP',
    phone: '+84 944 111 222',
    isFavorite: false,
  },
]

interface PeopleViewProps {
  onSendEmailTo: (email: string, name: string) => void
}

const AVATAR_COLORS = ['#0078d4', '#107c41', '#8764b8', '#d13438', '#008272', '#b4009e']

export const PeopleView: React.FC<PeopleViewProps> = ({ onSendEmailTo }) => {
  const [contacts, setContacts] = useState<ContactInfo[]>(DEMO_CONTACTS)
  const [selectedId, setSelectedId] = useState<string>(DEMO_CONTACTS[0].id)
  const [search, setSearch] = useState('')
  const [filterFav, setFilterFav] = useState(false)

  const selectedContact = contacts.find((c) => c.id === selectedId) || null

  const filtered = contacts.filter((c) => {
    if (filterFav && !c.isFavorite) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(q))
    )
  })

  const toggleFavorite = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    )
  }

  const handleAddContact = () => {
    const name = prompt('Nhập tên liên hệ mới:')
    if (!name) return
    const email = prompt('Nhập email liên hệ:')
    if (!email) return

    const newC: ContactInfo = {
      id: `c_${Date.now()}`,
      name,
      email,
      jobTitle: 'Cộng tác viên',
      department: 'Phát triển kinh doanh',
      company: '360 CORP',
      phone: '+84 9xx xxx xxx',
      isFavorite: false,
    }
    setContacts((prev) => [newC, ...prev])
    setSelectedId(newC.id)
  }

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden', backgroundColor: 'var(--surface, #ffffff)' }}>
      {/* Contact Sidebar Categories */}
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
        <button
          onClick={handleAddContact}
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
            marginBottom: '8px',
            boxShadow: '0 2px 4px rgba(0,120,212,0.2)',
          }}
        >
          ➕ Thêm liên hệ mới
        </button>

        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #878e96)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Danh bạ (People & Contacts)
        </div>
        <div
          onClick={() => setFilterFav(false)}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: !filterFav ? 'var(--hover, #e8f2fc)' : 'transparent',
            color: !filterFav ? '#0078d4' : 'var(--text-primary, #232425)',
            fontWeight: !filterFav ? 600 : 400,
          }}
        >
          <span>👥 Tất cả liên hệ</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>{contacts.length}</span>
        </div>
        <div
          onClick={() => setFilterFav(true)}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: filterFav ? 'var(--hover, #e8f2fc)' : 'transparent',
            color: filterFav ? '#0078d4' : 'var(--text-primary, #232425)',
            fontWeight: filterFav ? 600 : 400,
          }}
        >
          <span>⭐ Mục yêu thích</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>{contacts.filter((c) => c.isFavorite).length}</span>
        </div>
      </div>

      {/* Contact List */}
      <div
        style={{
          width: '340px',
          minWidth: '280px',
          borderRight: '1px solid var(--border, #e3e6ea)',
          backgroundColor: 'var(--surface, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border, #e3e6ea)', backgroundColor: 'var(--surface, #ffffff)' }}>
          <input
            type="text"
            placeholder="Tìm kiếm danh bạ, email, phòng ban..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border, #e3e6ea)',
              background: 'var(--surface-subtle, #f6f7f9)',
              color: 'var(--text-primary, #232425)',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted, #878e96)', fontSize: '13px' }}>
              Không tìm thấy liên hệ nào
            </div>
          ) : (
            filtered.map((c, idx) => {
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              const isSelected = selectedId === c.id

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-subtle, #efefef)',
                    backgroundColor: isSelected ? 'var(--hover, #e8f2fc)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #0078d4' : '3px solid transparent',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: avatarColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary, #232425)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {c.jobTitle ? `${c.jobTitle} • ${c.company}` : c.email}
                    </div>
                  </div>
                  {c.isFavorite && <span style={{ color: '#f59e0b', fontSize: '15px' }}>★</span>}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Contact Details Card (Responsive 100% Fluid Width) */}
      <div style={{ flex: 1, backgroundColor: 'var(--surface, #ffffff)', padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {selectedContact ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border, #e3e6ea)', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    backgroundColor: '#0078d4',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    fontWeight: 700,
                    boxShadow: '0 4px 10px rgba(0,120,212,0.25)',
                  }}
                >
                  {selectedContact.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>
                    {selectedContact.name}
                  </h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted, #878e96)' }}>
                    {selectedContact.jobTitle} — <span style={{ fontWeight: 500, color: 'var(--text-primary, #232425)' }}>{selectedContact.company}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => onSendEmailTo(selectedContact.email, selectedContact.name)}
                  style={{
                    backgroundColor: '#0078d4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(0,120,212,0.2)',
                  }}
                >
                  ✉️ Gửi Email (Compose)
                </button>

                <button
                  onClick={() => toggleFavorite(selectedContact.id)}
                  style={{
                    backgroundColor: selectedContact.isFavorite ? 'rgba(245,158,11,0.1)' : 'transparent',
                    color: selectedContact.isFavorite ? '#b45309' : 'var(--text-primary, #232425)',
                    border: '1px solid var(--border, #e3e6ea)',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {selectedContact.isFavorite ? '★ Đã yêu thích' : '☆ Thêm vào yêu thích'}
                </button>
              </div>
            </div>

            {/* Profile Information Table Fluid */}
            <div
              style={{
                backgroundColor: 'var(--surface-subtle, #f6f7f9)',
                borderRadius: '8px',
                padding: '20px 24px',
                border: '1px solid var(--border, #e3e6ea)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>
                Thông tin liên hệ & Công tác
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px', fontSize: '13px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted, #878e96)', fontWeight: 500 }}>Email công việc:</span>
                <span style={{ color: '#0078d4', fontWeight: 600 }}>{selectedContact.email}</span>

                <span style={{ color: 'var(--text-muted, #878e96)', fontWeight: 500 }}>Số điện thoại:</span>
                <span style={{ color: 'var(--text-primary, #232425)' }}>{selectedContact.phone || 'Chưa cập nhật'}</span>

                <span style={{ color: 'var(--text-muted, #878e96)', fontWeight: 500 }}>Phòng ban:</span>
                <span style={{ color: 'var(--text-primary, #232425)' }}>{selectedContact.department || 'Ban Kỹ Thuật'}</span>

                <span style={{ color: 'var(--text-muted, #878e96)', fontWeight: 500 }}>Doanh nghiệp / Tổ chức:</span>
                <span style={{ color: 'var(--text-primary, #232425)' }}>{selectedContact.company || '360 CORP'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted, #878e96)' }}>
            Chọn liên hệ từ danh sách bên trái để xem chi tiết
          </div>
        )}
      </div>
    </div>
  )
}
