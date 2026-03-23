import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'

export default function ChatPanel({ onHighlight, onFocusType, stats, onAskRef, theme }) {
  const { messages, isLoading, sendMessage, clearChat } = useChat({ onHighlight, onFocusType })
  const [input, setInput] = useState('')
  const msgsEndRef = useRef(null)

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Expose sendMessage to parent (App -> NodeDetail)
  useEffect(() => {
    if (onAskRef) onAskRef.current = sendMessage
  }, [sendMessage, onAskRef])

  const onSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput('')
  }

  const suggestions = [
    "How many sales orders are there?",
    "Which products appear in the most billing documents?",
    "Show orders delivered but not billed",
    "What is the total revenue per customer?",
    "Find cancelled billing documents",
    "Which plants handle the most deliveries?"
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme === 'space' ? 'transparent' : '#ffffff' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: theme === 'space' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        background: theme === 'space' ? 'rgba(255,255,255,0.05)' : '#ffffff',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: theme === 'space' ? '#f8fafc' : '#0f172a', letterSpacing: '-0.01em' }}>
              Chat with Graph
            </h2>
            <div style={{ fontSize: 12, color: theme === 'space' ? '#cbd5e1' : '#64748b', marginTop: 2, fontWeight: 500 }}>
              AI-powered SAP Insights
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{
                fontSize: 12, padding: '4px 8px', background: theme === 'space' ? 'rgba(255,255,255,0.1)' : '#f8fafc',
                border: theme === 'space' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0', borderRadius: 6, color: theme === 'space' ? '#cbd5e1' : '#64748b',
                cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
              }}
              onMouseOver={e => e.target.style.background = theme === 'space' ? 'rgba(255,255,255,0.2)' : '#f1f5f9'}
              onMouseOut={e => e.target.style.background = theme === 'space' ? 'rgba(255,255,255,0.1)' : '#f8fafc'}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: theme === 'space' ? 'transparent' : '#f8fafc',
      }}>
        {messages.length === 0 && (
          <div style={{ color: theme === 'space' ? '#cbd5e1' : '#64748b', fontSize: 13, lineHeight: '1.6' }}>
            <p style={{ fontWeight: 600, color: theme === 'space' ? '#f8fafc' : '#334155', marginBottom: 12 }}>Suggested Queries:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    textAlign: 'left', padding: '10px 14px', background: theme === 'space' ? 'rgba(15,23,42,0.6)' : '#ffffff',
                    border: theme === 'space' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: 10, color: theme === 'space' ? '#60a5fa' : '#3b82f6',
                    cursor: 'pointer', fontSize: 13, transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)', fontWeight: 500,
                  }}
                  onMouseOver={e => {
                    e.target.style.borderColor = theme === 'space' ? 'rgba(96,165,250,0.5)' : '#bfdbfe';
                    e.target.style.background = theme === 'space' ? 'rgba(59,130,246,0.15)' : '#eff6ff';
                  }}
                  onMouseOut={e => {
                    e.target.style.borderColor = theme === 'space' ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                    e.target.style.background = theme === 'space' ? 'rgba(15,23,42,0.6)' : '#ffffff';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === 'user' ? 'msg-user slide-in' : 'msg-assistant fade-in'}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              padding: '12px 16px',
              maxWidth: '90%',
              fontSize: 14,
              lineHeight: '1.5',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Assistant
              </div>
            )}
            
            <div style={{ whiteSpace: 'pre-wrap', fontWeight: msg.role === 'user' ? 500 : 400 }}>
              {msg.content}
            </div>

            {msg.sql && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ fontSize: 12, color: theme === 'space' ? '#818cf8' : '#6366f1', cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}>
                  ▶ View Generated SQL
                </summary>
                <pre style={{
                  marginTop: 8, padding: 10, background: theme === 'space' ? 'rgba(0,0,0,0.3)' : '#f1f5f9', borderRadius: 8,
                  fontSize: 11, overflowX: 'auto', color: theme === 'space' ? '#cbd5e1' : '#334155', border: theme === 'space' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
                }}>
                  {msg.sql}
                </pre>
              </details>
            )}

            {msg.data && msg.data.length > 0 && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ fontSize: 12, color: '#10b981', cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}>
                  ▶ View Data ({msg.row_count} rows)
                </summary>
                <div style={{ overflowX: 'auto', marginTop: 8 }}>
                  <table style={{ minWidth: '100%', fontSize: 11, borderCollapse: 'collapse', color: theme === 'space' ? '#cbd5e1' : '#475569' }}>
                    <thead>
                      <tr>
                        {Object.keys(msg.data[0]).map(k => (
                          <th key={k} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: theme === 'space' ? '2px solid rgba(255,255,255,0.2)' : '2px solid #cbd5e1', color: theme === 'space' ? '#f8fafc' : '#1e293b', fontWeight: 600 }}>
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {msg.data.slice(0, 10).map((row, i) => (
                        <tr key={i} style={{ borderBottom: theme === 'space' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                          {Object.values(row).map((v, j) => (
                            <td key={j} style={{ padding: '6px 8px' }}>{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {msg.data.length > 10 && (
                    <div style={{ padding: '8px', textAlign: 'center', color: '#94a3b8', fontSize: 11, fontStyle: 'italic' }}>
                      Showing 10 of {msg.data.length} rows
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="msg-assistant fade-in" style={{ alignSelf: 'flex-start', padding: '12px 16px', maxWidth: '85%' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Assistant</div>
            <div style={{ color: '#64748b', fontStyle: 'italic' }}>
              Thinking<span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={msgsEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: '16px',
        background: theme === 'space' ? 'rgba(15,23,42,0.5)' : '#ffffff',
        borderTop: theme === 'space' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        flexShrink: 0
      }}>
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about orders, deliveries, billing..."
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 24,
              border: theme === 'space' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: theme === 'space' ? 'rgba(0,0,0,0.3)' : '#f8fafc',
              color: theme === 'space' ? '#f8fafc' : '#334155', fontSize: 14, outline: 'none',
              fontFamily: "'Inter', sans-serif",
              transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.background = theme === 'space' ? 'rgba(0,0,0,0.5)' : '#ffffff'
              e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
            }}
            onBlur={e => {
              e.target.style.borderColor = theme === 'space' ? 'rgba(255,255,255,0.2)' : '#cbd5e1'
              e.target.style.background = theme === 'space' ? 'rgba(0,0,0,0.3)' : '#f8fafc'
              e.target.style.boxShadow = 'none'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              padding: '0 18px', borderRadius: '24px',
              background: input.trim() && !isLoading ? '#3b82f6' : '#e2e8f0',
              color: input.trim() && !isLoading ? '#fff' : '#94a3b8',
              border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, transform 0.1s',
              boxShadow: input.trim() && !isLoading ? '0 2px 6px rgba(59,130,246,0.4)' : 'none',
            }}
            onMouseOver={e => { if (input.trim() && !isLoading) e.currentTarget.style.background = '#2563eb' }}
            onMouseOut={e => { if (input.trim() && !isLoading) e.currentTarget.style.background = '#3b82f6' }}
            onMouseDown={e => { if (input.trim() && !isLoading) e.currentTarget.style.transform = 'scale(0.96)' }}
            onMouseUp={e => { if (input.trim() && !isLoading) e.currentTarget.style.transform = 'scale(1)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#94a3b8', display: 'flex', justifyContent: 'center', gap: 12 }}>
          <span>↵ Enter to send</span>
          <span>• Guardrails active</span>
        </div>
      </div>
    </div>
  )
}
