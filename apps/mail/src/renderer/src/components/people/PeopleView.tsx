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
  }
]

interface PeopleViewProps {
  onSendEmailTo: (email: string, name: string) => void
}

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

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
      {/* Contact Sidebar Categories */}
      <div
        style={{
          width: '200px',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--surface-subtle)',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 8px',
          gap: '4px',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase' }}>
          Danh bạ (Contacts)
        </div>
        <div
          onClick={() => setFilterFav(false)}
          className={`folder-item ${!filterFav ? 'active' : ''}`}
          style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', fontSize: '13px' }}
        >
          👥 Tất cả liên hệ ({contacts.length})
        </div>
        <div
          onClick={() => setFilterFav(true)}
          className={`folder-item ${filterFav ? 'active' : ''}`}
          style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', fontSize: '13px' }}
        >
          ⭐ Mục yêu thích ({contacts.filter((c) => c.isFavorite).length})
        </div>
      </div>

      {/* Contact List */}
      <div
        style={{
          width: '320px',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          <input
            type="text"
            placeholder="Tìm kiếm danh bạ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--surface-subtle)',
              color: 'var(--text)',
              fontSize: '12px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.05))',
                backgroundColor: selectedId === c.id ? 'var(--hover)' : 'transparent',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#0078d4',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                {c.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.jobTitle ? `${c.jobTitle} • ${c.company}` : c.email}
                </div>
              </div>
              {c.isFavorite && <span style={{ color: '#f59e0b', fontSize: '14px' }}>★</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Details Card */}
      <div style={{ flex: 1, backgroundColor: 'var(--surface)', padding: '24px', overflowY: 'auto' }}>
        {selectedContact ? (
          <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#0078d4',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 600,
                }}
              >
                {selectedContact.name.charAt(0)}
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 600, color: 'var(--text)' }}>
                  {selectedContact.name}
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {selectedContact.jobTitle} — {selectedContact.company}
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
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ✉️ Gửi Email
              </button>

              <button
                onClick={() => toggleFavorite(selectedContact.id)}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {selectedContact.isFavorite ? '★ Bỏ yêu thích' : '☆ Thêm vào yêu thích'}
              </button>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                Thông tin liên hệ & Công tác
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <span style={{ color: '#0078d4', fontWeight: 500 }}>{selectedContact.email}</span>

                <span style={{ color: 'var(--text-muted)' }}>Số điện thoại:</span>
                <span>{selectedContact.phone || 'Chưa cập nhật'}</span>

                <span style={{ color: 'var(--text-muted)' }}>Phòng ban:</span>
                <span>{selectedContact.department || 'Ban Giám đốc'}</span>

                <span style={{ color: 'var(--text-muted)' }}>Công ty:</span>
                <span>{selectedContact.company || '360 CORP'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Chọn liên hệ từ danh sách bên trái để xem chi tiết
          </div>
        )}
      </div>
    </div>
  )
}
