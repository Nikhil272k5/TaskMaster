import React, { useState, useEffect, useRef, useCallback } from 'react'
import GraphView from './components/GraphView'
import ChatPanel from './components/ChatPanel'
import NodeDetail from './components/NodeDetail'
import SearchBar from './components/SearchBar'
import Starfield from './components/Starfield'
import { api } from './api/client'

const NODE_TYPES = ['SalesOrder', 'Delivery', 'Billing', 'Customer', 'Product', 'Plant', 'JournalEntry']

// New soft light mode colors
export const TYPE_COLORS = {
  SalesOrder:   '#3b82f6',
  Delivery:     '#10b981',
  Billing:      '#f59e0b',
  Customer:     '#8b5cf6',
  Product:      '#06b6d4',
  Plant:        '#f43f5e',
  JournalEntry: '#94a3b8',
}

export default function App() {
  const [graphData, setGraphData] = useState(null)
  const [stats, setStats] = useState(null)
  const [highlightedNodes, setHighlightedNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleTypes, setVisibleTypes] = useState(
    Object.fromEntries(NODE_TYPES.map(t => [t, true]))
  )
  const [theme, setTheme] = useState('light')
  const [isLoading, setIsLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState('checking')
  const graphRef = useRef(null)
  const chatAskRef = useRef(null)

  useEffect(() => {
    if (theme === 'space') {
      document.body.classList.add('theme-space')
    } else {
      document.body.classList.remove('theme-space')
    }
  }, [theme])

  useEffect(() => {
    const init = async () => {
      try {
        const [healthRes, statsRes, graphRes] = await Promise.all([
          api.getHealth(),
          api.getStats(),
          api.getGraph(200),
        ])
        setBackendStatus(healthRes.data.db_loaded ? 'ok' : 'no-data')
        setStats(statsRes.data)
        setGraphData(graphRes.data)
      } catch (err) {
        setBackendStatus('error')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const handleHighlight = useCallback((nodeIds) => {
    setHighlightedNodes(nodeIds)
    setTimeout(() => setHighlightedNodes([]), 6000)
  }, [])

  const handleFocusType = useCallback((type) => {
    graphRef.current?.focusOnType?.(type)
  }, [])

  const handleNodeClick = useCallback((node) => setSelectedNode(node), [])

  const handleAskAboutNode = useCallback((question) => {
    setSelectedNode(null)
    chatAskRef.current?.(question)
  }, [])

  const toggleType = useCallback((type) => {
    setVisibleTypes(prev => ({ ...prev, [type]: !prev[type] }))
  }, [])

  const nodeCounts = {}
  if (graphData?.nodes) {
    graphData.nodes.forEach(n => {
      nodeCounts[n.type] = (nodeCounts[n.type] || 0) + 1
    })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: theme === 'space' ? 'transparent' : '#f8fafc',
      color: theme === 'space' ? '#f8fafc' : '#334155',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      transition: 'background 0.5s ease-in-out, color 0.5s ease-in-out',
    }}>
      {theme === 'space' && <Starfield />}
      {/* HEADER (Theme Aware) */}
      <div className={theme === 'space' ? 'glass' : ''} style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
        borderBottom: theme === 'space' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        background: theme === 'space' ? 'rgba(15, 23, 42, 0.4)' : '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        flexShrink: 0,
        zIndex: 40,
        transition: 'all 0.5s ease-in-out',
      }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(59,130,246,0.3)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/>
              <line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: theme === 'space' ? '#f8fafc' : '#0f172a', lineHeight: '1.2' }}>OTC Graph Explorer</div>
            <div style={{ fontSize: 12, color: theme === 'space' ? '#cbd5e1' : '#64748b' }}>SAP Order-to-Cash · AI-Powered</div>
          </div>
        </div>

        {/* Search bar center */}
        <div style={{ flex: 1, maxWidth: 360, marginLeft: 24 }}>
          <SearchBar
            theme={theme}
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => {
              setSearchTerm('')
              graphRef.current?.resetGraph?.()
            }}
          />
        </div>

        {/* Right controls */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: backendStatus === 'ok' ? '#10b981' : backendStatus === 'error' ? '#ef4444' : '#f59e0b',
              boxShadow: backendStatus === 'ok' ? '0 0 8px rgba(16,185,129,0.4)' : 'none',
            }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: theme === 'space' ? '#cbd5e1' : '#64748b' }}>
              {backendStatus === 'ok' ? 'Connected' : backendStatus === 'error' ? 'Offline' : 'Loading...'}
            </span>
          </div>
          
          <button
            onClick={() => setTheme(t => t === 'light' ? 'space' : 'light')}
            title="Toggle Space Mode"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8,
              background: theme === 'space' ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
              border: 'none', cursor: 'pointer', fontSize: 16,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {theme === 'light' ? '🚀' : '🌙'}
          </button>

          <button
            onClick={() => graphRef.current?.fitAll?.()}
            title="Fit all"
            style={{
              padding: '6px 12px', borderRadius: 6, border: theme === 'space' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
              background: theme === 'space' ? 'rgba(255,255,255,0.05)' : '#ffffff', 
              color: theme === 'space' ? '#f8fafc' : '#475569', 
              cursor: 'pointer', fontSize: 12,
              fontWeight: 500, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}
            onMouseOver={e => e.target.style.background = theme === 'space' ? 'rgba(255,255,255,0.15)' : '#f1f5f9'}
            onMouseOut={e => e.target.style.background = theme === 'space' ? 'rgba(255,255,255,0.05)' : '#ffffff'}
          >
            ⊞ Fit All
          </button>
          {graphData && (
            <span style={{ 
              fontSize: 12, color: theme === 'space' ? '#e2e8f0' : '#64748b', fontWeight: 500, 
              background: theme === 'space' ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
              padding: '4px 10px', borderRadius: 12 
            }}>
              {graphData.nodes?.length || 0} nodes · {graphData.links?.length || 0} edges
            </span>
          )}
        </div>
      </div>

      {/* MAIN BODY - side by side */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* GRAPH SIDE */}
        <div style={{
          flex: 1,
          minWidth: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div className={theme === 'space' ? 'glass' : ''} style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 30,
            background: theme === 'space' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255,255,255,0.95)',
            border: theme === 'space' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '12px 14px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            transition: 'all 0.5s',
          }}>
            <div style={{ fontSize: 11, color: theme === 'space' ? '#cbd5e1' : '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Node Types
            </div>
            {NODE_TYPES.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 6px', borderRadius: 6, marginBottom: 2,
                  opacity: visibleTypes[type] ? 1 : 0.4,
                  transition: 'opacity 0.2s, background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = theme === 'space' ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                <div className={`badge-${type.toLowerCase()}`} style={{ 
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  border: theme === 'space' ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(0,0,0,0.1)' 
                }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: theme === 'space' ? '#f8fafc' : '#334155', flex: 1, textAlign: 'left' }}>{type}</span>
                <span style={{ fontSize: 11, color: theme === 'space' ? '#94a3b8' : '#94a3b8', minWidth: 18, textAlign: 'right' }}>{nodeCounts[type] || 0}</span>
              </button>
            ))}
          </div>

          {/* The actual graph canvas */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            {isLoading && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'rgba(248,250,252,0.85)', zIndex: 50,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 36, height: 36, border: '3px solid #6366f1',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
                  }} />
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#475569' }}>Loading SAP data...</p>
                </div>
              </div>
            )}
            {backendStatus === 'error' && !isLoading && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  textAlign: 'center', padding: 32,
                  background: '#ffffff', borderRadius: 16,
                  border: '1px solid #ef4444',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                  <p style={{ color: '#0f172a', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Backend Offline</p>
                  <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
                    Please run this command in your <code>/backend</code> directory:
                  </p>
                  <code style={{
                    display: 'block', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8,
                    padding: '10px 16px', fontSize: 13, color: '#334155', fontWeight: 500,
                  }}>
                    python -m uvicorn main:app --port 8000
                  </code>
                </div>
              </div>
            )}
            {graphData && !isLoading && (
              <GraphView
                ref={graphRef}
                theme={theme}
                graphData={graphData}
                highlightedNodes={highlightedNodes}
                visibleTypes={visibleTypes}
                searchTerm={searchTerm}
                onNodeClick={handleNodeClick}
              />
            )}

            {selectedNode && (
              <NodeDetail
                theme={theme}
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onAskAbout={handleAskAboutNode}
              />
            )}
          </div>
        </div>

        {/* CHAT PANEL - fixed right */}
        <div className={theme === 'space' ? 'glass' : ''} style={{
          width: 380,
          minWidth: 320,
          maxWidth: 450,
          flexShrink: 0,
          borderLeft: theme === 'space' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          background: theme === 'space' ? 'transparent' : '#ffffff',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.02)',
          zIndex: 10,
          transition: 'all 0.5s',
        }}>
          <ChatPanel
            theme={theme}
            onHighlight={handleHighlight}
            onFocusType={handleFocusType}
            stats={stats}
            onAskRef={chatAskRef}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
