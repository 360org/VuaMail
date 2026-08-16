import React, { useState } from 'react'
import type { MailFilterRule, RuleCondition, RuleAction } from '@genoffice/mail-engine'

interface RulesModalProps {
  isOpen: boolean
  onClose: () => void
  rules: MailFilterRule[]
  onSaveRules: (rules: MailFilterRule[]) => void
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  rules: initialRules,
  onSaveRules,
}) => {
  const [rules, setRules] = useState<MailFilterRule[]>(initialRules)
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(
    initialRules[0]?.id || null
  )

  if (!isOpen) return null

  const selectedRule = rules.find((r) => r.id === selectedRuleId) || rules[0] || null

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const handleAddRule = () => {
    const newRule: MailFilterRule = {
      id: `rule_${Date.now()}`,
      name: `Quy tắc mới ${rules.length + 1}`,
      enabled: true,
      matchAllConditions: true,
      conditions: [{ field: 'subject', operator: 'contains', value: '' }],
      actions: [{ type: 'markAsStarred' }],
    }
    setRules((prev) => [...prev, newRule])
    setSelectedRuleId(newRule.id)
  }

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
    if (selectedRuleId === id) {
      setSelectedRuleId(null)
    }
  }

  const handleUpdateRuleName = (name: string) => {
    if (!selectedRule) return
    setRules((prev) =>
      prev.map((r) => (r.id === selectedRule.id ? { ...r, name } : r))
    )
  }

  const handleAddCondition = () => {
    if (!selectedRule) return
    const newCond: RuleCondition = { field: 'from', operator: 'contains', value: '' }
    setRules((prev) =>
      prev.map((r) =>
        r.id === selectedRule.id
          ? { ...r, conditions: [...r.conditions, newCond] }
          : r
      )
    )
  }

  const handleAddAction = () => {
    if (!selectedRule) return
    const newAct: RuleAction = { type: 'markAsRead' }
    setRules((prev) =>
      prev.map((r) =>
        r.id === selectedRule.id
          ? { ...r, actions: [...r.actions, newAct] }
          : r
      )
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-bg-overlay, rgba(0,0,0,0.45))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
    >
      <div
        style={{
          width: '720px',
          height: '520px',
          backgroundColor: 'var(--surface)',
          borderRadius: '8px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'var(--surface-subtle)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px' }}>⚡</span>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              Quản lý Quy tắc Lọc Thư (Outlook Mail Rules & Filters)
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: 'var(--text-muted)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body Split */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Rules List Sidebar */}
          <div
            style={{
              width: '240px',
              borderRight: '1px solid var(--border)',
              backgroundColor: 'var(--surface-subtle)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={handleAddRule}
                style={{
                  width: '100%',
                  padding: '6px',
                  backgroundColor: '#0078d4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                + Tạo quy tắc mới
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
              {rules.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRuleId(r.id)}
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor:
                      selectedRule?.id === r.id ? 'var(--hover)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      checked={r.enabled}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleToggleRule(r.id)
                      }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{r.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteRule(r.id)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    🗑
                  </button>
                </div>
              ))}
              {rules.length === 0 && (
                <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Chưa có quy tắc lọc nào.
                </div>
              )}
            </div>
          </div>

          {/* Rule Detail Form */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {selectedRule ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Tên quy tắc:</label>
                  <input
                    type="text"
                    value={selectedRule.name}
                    onChange={(e) => handleUpdateRuleName(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--surface-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Conditions Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Điều kiện kích hoạt (Conditions):</span>
                    <button
                      onClick={handleAddCondition}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0078d4',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      + Thêm điều kiện
                    </button>
                  </div>

                  {selectedRule.conditions.map((cond, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        backgroundColor: 'var(--surface-subtle)',
                        padding: '6px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nếu</span>
                      <select
                        value={cond.field}
                        onChange={(e) => {
                          const val = e.target.value as any
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === selectedRule.id
                                ? {
                                    ...r,
                                    conditions: r.conditions.map((c, i) =>
                                      i === idx ? { ...c, field: val } : c
                                    ),
                                  }
                                : r
                            )
                          )
                        }}
                        style={{ fontSize: '11px', padding: '2px 4px' }}
                      >
                        <option value="subject">Tiêu đề (Subject)</option>
                        <option value="from">Người gửi (From)</option>
                        <option value="to">Người nhận (To)</option>
                        <option value="body">Nội dung (Body)</option>
                        <option value="hasAttachments">Có đính kèm</option>
                      </select>

                      <select
                        value={cond.operator}
                        onChange={(e) => {
                          const val = e.target.value as any
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === selectedRule.id
                                ? {
                                    ...r,
                                    conditions: r.conditions.map((c, i) =>
                                      i === idx ? { ...c, operator: val } : c
                                    ),
                                  }
                                : r
                            )
                          )
                        }}
                        style={{ fontSize: '11px', padding: '2px 4px' }}
                      >
                        <option value="contains">chứa</option>
                        <option value="equals">bằng chính xác</option>
                        <option value="startsWith">bắt đầu với</option>
                        <option value="endsWith">kết thúc với</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Giá trị so khớp..."
                        value={String(cond.value)}
                        onChange={(e) => {
                          const val = e.target.value
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === selectedRule.id
                                ? {
                                    ...r,
                                    conditions: r.conditions.map((c, i) =>
                                      i === idx ? { ...c, value: val } : c
                                    ),
                                  }
                                : r
                            )
                          )
                        }}
                        style={{
                          flex: 1,
                          fontSize: '11px',
                          padding: '4px',
                          borderRadius: '3px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Actions Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Hành động thực thi (Actions):</span>
                    <button
                      onClick={handleAddAction}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0078d4',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      + Thêm hành động
                    </button>
                  </div>

                  {selectedRule.actions.map((act, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        backgroundColor: 'var(--surface-subtle)',
                        padding: '6px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thì</span>
                      <select
                        value={act.type}
                        onChange={(e) => {
                          const val = e.target.value as any
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === selectedRule.id
                                ? {
                                    ...r,
                                    actions: r.actions.map((a, i) =>
                                      i === idx ? { ...a, type: val } : a
                                    ),
                                  }
                                : r
                            )
                          )
                        }}
                        style={{ fontSize: '11px', padding: '2px 4px' }}
                      >
                        <option value="markAsStarred">Gắn dấu sao (Star)</option>
                        <option value="markAsRead">Đánh dấu đã đọc</option>
                        <option value="moveToFolder">Chuyển sang thư mục</option>
                        <option value="applyLabel">Gắn nhãn (Tag)</option>
                      </select>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                Chọn một quy tắc hoặc tạo quy tắc mới để thiết lập điều kiện lọc.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: 'var(--surface-subtle)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onSaveRules(rules)
              onClose()
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#0078d4',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Lưu quy tắc
          </button>
        </div>
      </div>
    </div>
  )
}
