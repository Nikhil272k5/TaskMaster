import React from 'react'

const TYPE_COLORS = {
  SalesOrder:   '#3b82f6', // soft blue
  Delivery:     '#10b981', // soft green
  Billing:      '#f59e0b', // soft amber
  Customer:     '#8b5cf6', // soft purple
  Product:      '#06b6d4', // soft cyan
  Plant:        '#f43f5e', // soft rose
  JournalEntry: '#94a3b8', // soft slate
}

export default function NodeDetail({ node, onClose, onAskAbout, theme }) {
  if (!node) return null

  const color = TYPE_COLORS[node.type] || '#cbd5e1'
  const props = node.props || {}

  const handleAsk = () => {
    let q = `Tell me about ${node.type} ${node.id}`
    if (node.type === 'Customer') q = `Show me all orders and billing for customer ${node.id}`
    else if (node.type === 'SalesOrder') q = `What is the status of sales order ${node.id}?`
    else if (node.type === 'Product') q = `Which customers bought product ${node.id}?`
    onAskAbout(q)
  }

  return (
    <div
      className="slide-in glass"
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        width: 320,
        maxHeight: 'calc(100% - 40px)',
        overflowY: 'auto',
        borderRadius: 16,
        padding: 0,
        zIndex: 100,
        background: theme === 'space' ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
        border: theme === 'space' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: theme === 'space' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f1f5f9', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: theme === 'space' ? 'rgba(255,255,255,0.1)' : '#f1f5f9', border: 'none', color: theme === 'space' ? '#cbd5e1' : '#64748b', cursor: 'pointer',
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = theme === 'space' ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}
          onMouseOut={e => e.currentTarget.style.background = theme === 'space' ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}
        >
          ✕
        </button>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 20,
          background: `${color}15`, color: color,
          fontSize: 12, fontWeight: 600, border: `1px solid ${color}30`,
          textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          {node.type}
        </div>
        
        <h3 style={{ margin: '12px 0 4px', fontSize: 20, color: theme === 'space' ? '#f8fafc' : '#0f172a', fontWeight: 700, wordBreak: 'break-all', lineHeight: '1.2' }}>
          {node.label || node.id}
        </h3>
        <div style={{ fontSize: 13, color: theme === 'space' ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}>
          ID: {node.id}
        </div>
      </div>

      {/* Action */}
      <div style={{ padding: '16px 20px', borderBottom: theme === 'space' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f1f5f9', background: theme === 'space' ? 'rgba(0,0,0,0.2)' : '#f8fafc' }}>
        <button
          onClick={handleAsk}
          style={{
            width: '100%', padding: '10px 0', borderRadius: 8,
            background: theme === 'space' ? 'rgba(59,130,246,0.15)' : '#ffffff', border: '1px solid currentColor', color: theme === 'space' ? '#60a5fa' : '#6366f1',
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = theme === 'space' ? 'rgba(59,130,246,0.25)' : '#eff6ff'
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = theme === 'space' ? 'rgba(59,130,246,0.15)' : '#ffffff'
          }}
        >
          <span>Ask AI about this {node.type}</span>
          <span>→</span>
        </button>
      </div>

      {/* Properties List */}
      <div style={{ padding: '16px 20px' }}>
        <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', margin: '0 0 12px 0' }}>
          Properties
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(props).filter(([_, v]) => v != null && v !== '').map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: theme === 'space' ? '#cbd5e1' : '#64748b', fontWeight: 500 }}>{k}</span>
              <span style={{ fontSize: 13, color: theme === 'space' ? '#f8fafc' : '#1e293b', wordBreak: 'break-all', fontWeight: 500 }}>
                {String(v)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
