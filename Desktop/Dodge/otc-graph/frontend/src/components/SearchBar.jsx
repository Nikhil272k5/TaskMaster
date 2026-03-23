import React from 'react'

export default function SearchBar({ value, onChange, onClear, theme }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
      {/* Search icon */}
      <svg
        style={{ position: 'absolute', left: 12, color: '#94a3b8', flexShrink: 0, width: 14, height: 14, minWidth: 14 }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search nodes by ID or name..."
        style={{
          width: '100%',
          paddingLeft: 36,
          paddingRight: value ? 32 : 12,
          paddingTop: 8,
          paddingBottom: 8,
          background: theme === 'space' ? 'rgba(0,0,0,0.3)' : '#f8fafc',
          border: theme === 'space' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
          borderRadius: 8,
          fontSize: 13,
          color: theme === 'space' ? '#f8fafc' : '#334155',
          outline: 'none',
          fontFamily: "'Inter', sans-serif",
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#6366f1'
          e.target.style.boxShadow = theme === 'space' ? '0 0 0 3px rgba(99,102,241,0.3)' : '0 0 0 3px rgba(99,102,241,0.1)'
        }}
        onBlur={e => {
          e.target.style.borderColor = theme === 'space' ? 'rgba(255,255,255,0.2)' : '#cbd5e1'
          e.target.style.boxShadow = 'none'
        }}
      />

      {value && (
        <button
          onClick={onClear}
          style={{
            position: 'absolute', right: 10,
            background: theme === 'space' ? 'rgba(255,255,255,0.1)' : '#e2e8f0', border: 'none', cursor: 'pointer',
            color: theme === 'space' ? '#cbd5e1' : '#64748b', padding: 4, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = theme === 'space' ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}
          onMouseOut={e => e.currentTarget.style.background = theme === 'space' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
