import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent'

cytoscape.use(coseBilkent)

// ─── Constants ───────────────────────────────────────────────────────────────

export const TYPE_COLORS = {
  SalesOrder:   '#3b82f6', // soft blue
  Delivery:     '#10b981', // soft green
  Billing:      '#f59e0b', // soft amber
  Customer:     '#8b5cf6', // soft purple
  Product:      '#06b6d4', // soft cyan
  Plant:        '#f43f5e', // soft rose
  JournalEntry: '#94a3b8', // soft slate
}

export const planetTextures = {
  SalesOrder:   '/assets/planets/SalesOrder.svg',
  Delivery:     '/assets/planets/Delivery.svg',
  Billing:      '/assets/planets/Billing.svg',
  Customer:     '/assets/planets/Customer.svg',
  Product:      '/assets/planets/Product.svg',
  Plant:        '/assets/planets/Plant.svg',
  JournalEntry: '/assets/planets/JournalEntry.svg',
}

const TYPE_LABELS = {
  SalesOrder: 'Sales Order', Delivery: 'Delivery',   Billing: 'Billing',
  Customer:   'Customer',    Product:  'Product',     Plant: 'Plant',
  JournalEntry: 'Journal Entry',
}

// Minimal, Light UI Base Styles
const BASE_STYLES = [
  {
    selector: 'node',
    style: {
      'width': 30,
      'height': 30,
      'background-color': 'data(color)',
      'background-opacity': 0.9,
      'border-width': 2,
      'border-color': '#ffffff', // 2px white border
      'border-opacity': 1,
      'shape': 'ellipse',        // smooth rounded node
      'label': 'data(shortLabel)',
      'font-size': '10px',
      'font-family': 'Inter, system-ui, sans-serif',
      'font-weight': '500',
      'color': '#475569',        // slate-600
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 4,
      'text-max-width': '70px',
      'text-wrap': 'ellipsis',
      'text-background-color': 'rgba(255, 255, 255, 0.7)',
      'text-background-opacity': 1,
      'text-background-padding': '2px',
      'text-background-shape': 'roundrectangle',
      'opacity': 1,
      // CSS transitions for hover & focus
      'transition-property': 'opacity, width, height, border-width, background-color, border-color, shadow-blur, shadow-color',
      'transition-duration': '300ms',
      'transition-timing-function': 'ease-in-out',
      'z-index': 10,
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 1,
      'line-color': '#cbd5e1',     // light gray edge
      'curve-style': 'bezier',     // smooth curve
      'arrow-scale': 0.4,
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#cbd5e1',
      'opacity': 0.6,
      'transition-property': 'opacity, line-color, width, target-arrow-color',
      'transition-duration': '300ms',
      'z-index': 1,
    }
  },
  // ── Hover state ──
  {
    selector: 'node.cy-hover',
    style: {
      'width': 45,
      'height': 45,
      'background-opacity': 1,
      'border-width': 3,
      'border-color': '#ffffff',
      'z-index': 1000,
    }
  },
  // ── Focus/Click state ──
  {
    selector: 'node.cy-focused',
    style: {
      'width': 48,
      'height': 48,
      'background-opacity': 1,
      'border-width': 4,
      'border-color': '#ffffff',
      'z-index': 999,
    }
  },
  // ── Dimmed state (others) ──
  {
    selector: '.cy-dimmed',
    style: {
      'opacity': 0.2,            // 0.2 instead of 0.06 to remain somewhat visible
      'width': 22,
      'height': 22,
    }
  },
  // ── AI Highlight state (Yellow Glow) ──
  {
    selector: '.cy-highlighted',
    style: {
      'background-color': '#fbbf24', // Amber 400
      'border-color': '#ffffff',
      'border-width': 4,
      'width': 42,
      'height': 42,
      'opacity': 1,
      'z-index': 998,
    }
  },
  // ── Search matching ──
  {
    selector: '.cy-search-match',
    style: {
      'border-width': 4,
      'border-color': '#6366f1',
      'width': 40,
      'height': 40,
      'opacity': 1,
      'z-index': 997,
    }
  },
  {
    selector: '.cy-search-miss',
    style: {
      'opacity': 0.15,
      'width': 20,
      'height': 20,
    }
  },
  // ── Edge states ──
  {
    selector: 'edge.cy-focused-edge',
    style: {
      'opacity': 0.9,
      'line-color': '#94a3b8',
      'target-arrow-color': '#94a3b8',
      'width': 1.8,
      'z-index': 9,
    }
  },
  {
    selector: 'edge.cy-dimmed-edge',
    style: { 'opacity': 0.1 }
  },
  {
    selector: '.cy-hidden',
    style: { 'display': 'none' }
  },
]

// ── Space Mode Styles (Derived from BASE) ──
const SPACE_STYLES = BASE_STYLES.map(style => {
  const isNode = style.selector === 'node'
  const isEdge = style.selector === 'edge'
  const isHover = style.selector === 'node.cy-hover'
  const isFocused = style.selector === 'node.cy-focused'
  const isFocusedEdge = style.selector === 'edge.cy-focused-edge'
  
  if (isNode) {
    return { ...style, style: { ...style.style, 
      'border-width': 2, 
      'border-color': 'rgba(255,255,255,0.6)', 
      'color': '#cbd5e1', 
      'text-background-color': 'rgba(15, 23, 42, 0.7)',
      'shadow-blur': 20,
      'shadow-color': 'rgba(255,255,255,0.6)',
      'shadow-opacity': 0.6,
      'width': 55,
      'height': 55,
      'background-color': 'data(color)',
      'background-image': 'data(texture)',
      'background-fit': 'cover',
    }}
  }
  if (isEdge) {
    return { ...style, style: { ...style.style, 
      'line-color': '#ffffff', 
      'target-arrow-color': '#ffffff', 
      'opacity': 0.15 
    }}
  }
  if (isHover) {
    return { ...style, style: { ...style.style, 
      'border-width': 3, 'border-color': '#ffffff',
      'shadow-blur': 30, 'shadow-opacity': 1,
      'width': 66, 'height': 66,
    }}
  }
  if (isFocused) {
    return { ...style, style: { ...style.style, 
      'border-width': 4, 'border-color': '#ffffff',
      'shadow-blur': 40, 'shadow-opacity': 1,
      'width': 70, 'height': 70,
    }}
  }
  if (isFocusedEdge) {
    return { ...style, style: { ...style.style, 
      'line-color': '#ffffff', 'target-arrow-color': '#ffffff', 'opacity': 0.6 
    }}
  }
  return style
})

// ─── Component ───────────────────────────────────────────────────────────────

const GraphView = forwardRef(function GraphView(
  { graphData, highlightedNodes, visibleTypes, searchTerm, onNodeClick, theme },
  ref
) {
  const containerRef  = useRef(null)
  const cyRef         = useRef(null)
  const tooltipRef    = useRef(null)
  const resetTimerRef = useRef(null)
  const interactionTimerRef = useRef(null)
  const roRef         = useRef(null)

  // ── Public API (via ref) ──────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    focusOnType: (type) => handleAiFocus(type),
    resetGraph:  ()     => resetGraph(),
    fitAll:      ()     => { const cy = cyRef.current; if (cy && !cy.destroyed()) cy.fit(undefined, 70) },
  }))

  // ── Staged AI focus animation ──────────────────────────────────────────────
  const handleAiFocus = useCallback((type) => {
    const cy = cyRef.current
    if (!cy || cy.destroyed()) return
    clearTimeout(resetTimerRef.current)
    clearTimeout(interactionTimerRef.current)

    const focused = cy.nodes().filter(n => n.data('type') === type)
    const dimmed  = cy.nodes().filter(n => n.data('type') !== type)

    // STAGE 1: batch dim everything first
    cy.batch(() => {
      cy.nodes().removeClass('cy-focused cy-dimmed cy-highlighted cy-hover cy-search-match cy-search-miss')
      cy.edges().removeClass('cy-focused-edge cy-dimmed-edge')
      dimmed.addClass('cy-dimmed')
      cy.edges().addClass('cy-dimmed-edge')
    })

    // STAGE 2: zoom smoothly to cluster
    setTimeout(() => {
      if (!cy || cy.destroyed()) return
      if (focused.length) {
        cy.animate({
          fit: { eles: focused, padding: 80 },
          duration: 600,
          easing: 'ease-in-out',
        })
      }
    }, 200)

    // STAGE 3: highlight focused nodes
    setTimeout(() => {
      if (!cy || cy.destroyed()) return
      cy.batch(() => {
        focused.addClass('cy-focused')
        focused.connectedEdges().removeClass('cy-dimmed-edge').addClass('cy-focused-edge')
      })

      // Bounce effect down to 48px
      focused.animate({ style: { width: 56, height: 56 } }, {
        duration: 200, easing: 'ease-out',
        complete: () => {
          if (!cy.destroyed()) {
            focused.animate({ style: { width: 48, height: 48 } }, { duration: 250, easing: 'ease-in-out' })
          }
        }
      })
    }, 400)

    // Auto-reset after a delay of 5s unless interrupted
    resetTimerRef.current = setTimeout(() => resetGraph(), 5000)
  }, [])

  // ── Reset graph to neutral state ──────────────────────────────────────────
  const resetGraph = useCallback(() => {
    const cy = cyRef.current
    if (!cy || cy.destroyed()) return
    clearTimeout(resetTimerRef.current)
    clearTimeout(interactionTimerRef.current)
    
    cy.batch(() => {
      cy.nodes().removeClass('cy-focused cy-dimmed cy-highlighted cy-hover cy-search-match cy-search-miss')
      cy.edges().removeClass('cy-focused-edge cy-dimmed-edge')
    })
    cy.animate({
      zoom: 0.8,
      center: { eles: cy.elements().not('.cy-hidden') }
    }, {
      duration: 500,
      easing: 'ease-in-out',
    })
  }, [])

  // ── Init Cytoscape ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || !graphData?.nodes?.length) return

    clearTimeout(resetTimerRef.current)
    clearTimeout(interactionTimerRef.current)
    if (roRef.current) { roRef.current.disconnect(); roRef.current = null }
    if (tooltipRef.current?.parentNode) { tooltipRef.current.remove(); tooltipRef.current = null }
    if (cyRef.current && !cyRef.current.destroyed()) { cyRef.current.destroy(); cyRef.current = null }

    // Build elements
    const elements = [
      ...graphData.nodes.map(n => {
        const lbl = n.label || n.id
        return {
          data: {
            id: n.id,
            shortLabel: lbl.length > 12 ? lbl.slice(0, 12) + '…' : lbl,
            fullLabel: lbl,
            type: n.type,
            color: TYPE_COLORS[n.type] || '#cbd5e1',
            texture: planetTextures[n.type] || planetTextures['JournalEntry'],
            props: n.props || {},
          }
        }
      }),
      ...graphData.links
        .filter(l => l.source && l.target && l.source !== l.target)
        .map((l, i) => ({
          data: { id: `e${i}`, source: l.source, target: l.target, relType: l.type || '' }
        }))
    ]

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: theme === 'space' ? SPACE_STYLES : BASE_STYLES,
      layout: {
        name: 'cose-bilkent',
        animate: true,
        animationDuration: 800,      // Bubble-like smooth movement
        fit: false,                  // IMPORTANT: prevents auto zoom
        padding: 30,
        nodeRepulsion: 500000,       // Very high repulsion (floating bubbles)
        idealEdgeLength: 100,        // Spaced out
        edgeElasticity: 0.1,
        gravity: 0.05,               // Low gravity -> less central pulling
        gravityRange: 3.5,
        numIter: 1000,
        randomize: true,
        stop: () => {
          if (!cy.destroyed()) {
            // Smooth initial positioning
            cy.animate({
              zoom: 0.8,
              center: { eles: cy.elements() }
            }, {
              duration: 500
            })
          }
        }
      },
      wheelSensitivity: 0.15, // Softer zoom
      minZoom: 0.5,
      maxZoom: 2,
      boxSelectionEnabled: false,
    })

    // ─── Tooltip setup ──────────────────────────────────────────────────
    const tooltip = document.createElement('div')
    Object.assign(tooltip.style, {
      display: 'none', position: 'absolute', zIndex: '1000',
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: '12px', padding: '12px 14px', fontSize: '13px',
      color: '#334155', fontFamily: 'Inter, sans-serif', minWidth: '220px', maxWidth: '300px',
      pointerEvents: 'none', lineHeight: '1.4',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
      transition: 'opacity 0.2s', opacity: '0'
    })
    containerRef.current.appendChild(tooltip)
    tooltipRef.current = tooltip

    // ─── Interaction: Hover (Scale + Glow + Tooltip) ────────────────────
    cy.on('mouseover', 'node', (e) => {
      const n = e.target
      
      // Cursor pointer
      containerRef.current.style.cursor = 'pointer'

      // Only apply hover class if we're not currently focused on a specific click
      if (!n.hasClass('cy-focused')) {
        n.addClass('cy-hover')
        // Connected edges highlight slightly
        n.connectedEdges().addClass('cy-focused-edge')
      }

      // Tooltip content
      const d = n.data()
      const props = d.props || {}
      const color = d.color
      let html = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.1);${theme === 'space' ? 'box-shadow: 0 0 8px ' + color : ''}"></div>
          <div style="font-weight:600;color:${theme === 'space' ? '#f8fafc' : '#0f172a'};font-size:13px;">${TYPE_LABELS[d.type] || d.type}</div>
        </div>`
      html += `<div style="color:${theme === 'space' ? '#94a3b8' : '#64748b'};font-size:11px;font-family:monospace;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ${theme === 'space' ? 'rgba(255,255,255,0.1)' : '#f1f5f9'};">ID: ${d.id}</div>`
      
      const keys = Object.keys(props).filter(k => props[k] != null && props[k] !== '' && String(props[k]) !== 'null').slice(0, 5)
      if (keys.length) {
        keys.forEach(k => {
          const val = String(props[k]).slice(0, 32)
          html += `<div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:4px;">
            <span style="color:${theme === 'space' ? '#cbd5e1' : '#64748b'};font-size:11px;flex-shrink:0;">${k}</span>
            <span style="font-size:11px;color:${theme === 'space' ? '#f8fafc' : '#334155'};text-align:right;font-weight:500;">${val}</span>
          </div>`
        })
      }
      tooltip.innerHTML = html
      tooltip.style.display = 'block'
      requestAnimationFrame(() => tooltip.style.opacity = '1')
    })

    cy.on('mousemove', (e) => {
      if (!tooltipRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      let x = e.originalEvent.clientX - rect.left + 20
      let y = e.originalEvent.clientY - rect.top + 20
      if (x + 280 > rect.width) x = e.originalEvent.clientX - rect.left - 260
      if (y + 180 > rect.height) y = e.originalEvent.clientY - rect.top - 180
      tooltipRef.current.style.transform = `translate(${x}px, ${y}px)`
    })

    cy.on('mouseout', 'node', (e) => {
      containerRef.current.style.cursor = 'default'
      const n = e.target
      n.removeClass('cy-hover')
      // Only remove edge focus if not actively clicked
      if (!n.hasClass('cy-focused')) {
        n.connectedEdges().removeClass('cy-focused-edge')
      }
      
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = '0'
        setTimeout(() => { if (tooltipRef.current?.style.opacity === '0') tooltipRef.current.style.display = 'none' }, 200)
      }
    })

    // ─── Interaction: Click (Zoom Focus) ────────────────────────────────
    cy.on('tap', 'node', (e) => {
      const n = e.target
      clearTimeout(interactionTimerRef.current)
      clearTimeout(resetTimerRef.current)
      
      // Cleanup previous focus/dims
      cy.batch(() => {
        cy.nodes().removeClass('cy-focused cy-dimmed cy-hover')
        cy.edges().removeClass('cy-focused-edge cy-dimmed-edge')
        
        // Dim all others
        cy.nodes().not(n).not(n.connectedNodes()).addClass('cy-dimmed')
        cy.edges().not(n.connectedEdges()).addClass('cy-dimmed-edge')
        
        // Highlight clicked + neighbors
        n.addClass('cy-focused')
        n.connectedEdges().addClass('cy-focused-edge')
        // Ensure neighbors are not dimmed
        n.connectedNodes().removeClass('cy-dimmed')
      })

      // Zoom + Center
      cy.animate({
        center: { eles: n },
        zoom: Math.max(cy.zoom(), 1.5),
      }, {
        duration: 500,
        easing: 'ease-in-out'
      })

      // Trigger user callback (sidebar panel)
      if (onNodeClick) {
        onNodeClick({ id: n.id(), type: n.data('type'), props: n.data('props'), label: n.data('fullLabel') })
      }

      // Restore graph after 4s unless another action occurs
      interactionTimerRef.current = setTimeout(() => {
        resetGraph()
      }, 4000)
    })

    cy.on('tap', (e) => {
      if (e.target === cy) {
        resetGraph()
        if (onNodeClick) onNodeClick(null)
      }
    })

    // ─── ResizeObserver: keep cy canvas synced ─────────────────────────
    const ro = new ResizeObserver(() => {
      if (cy && !cy.destroyed()) { 
        cy.resize(); 
        cy.center(); 
      }
    })
    ro.observe(containerRef.current)
    roRef.current = ro
    cyRef.current = cy

    return () => {
      clearTimeout(resetTimerRef.current)
      clearTimeout(interactionTimerRef.current)
      if (roRef.current) { roRef.current.disconnect(); roRef.current = null }
      if (tooltipRef.current?.parentNode) { tooltipRef.current.remove(); tooltipRef.current = null }
      if (cy && !cy.destroyed()) cy.destroy()
      cyRef.current = null
    }
  }, [graphData]) // End Init

  // ── Highlighted nodes (from AI response) ─────────────────────────────────
  useEffect(() => {
    const cy = cyRef.current
    if (!cy || cy.destroyed()) return
    cy.nodes().removeClass('cy-highlighted')
    if (highlightedNodes?.length) {
      highlightedNodes.forEach(id => {
        const n = cy.getElementById(id)
        if (n.length) {
          n.addClass('cy-highlighted')
          // Bounce effect on AI highlight
          n.animate({ style: { width: 50, height: 50 } }, {
            duration: 250, easing: 'ease-out',
            complete: () => {
              if (!cy.destroyed()) n.animate({ style: { width: 42, height: 42 } }, { duration: 250 })
            }
          })
        }
      })
    }
  }, [highlightedNodes])

  // ── Type filter (show/hide) ───────────────────────────────────────────────
  useEffect(() => {
    const cy = cyRef.current
    if (!cy || cy.destroyed() || !visibleTypes) return
    cy.batch(() => {
      cy.nodes().forEach(n => {
        if (visibleTypes[n.data('type')] === false) n.addClass('cy-hidden')
        else n.removeClass('cy-hidden')
      })
    })
  }, [visibleTypes])

  // ── Search dimming ────────────────────────────────────────────────────────
  useEffect(() => {
    const cy = cyRef.current
    if (!cy || cy.destroyed()) return
    if (!searchTerm?.trim()) {
      cy.batch(() => {
        cy.nodes().removeClass('cy-search-match cy-search-miss')
        cy.edges().removeClass('cy-focused-edge cy-dimmed-edge')
      })
      return
    }
    const term = searchTerm.toLowerCase().trim()
    cy.batch(() => {
      cy.nodes().forEach(n => {
        const hit = n.id().toLowerCase().includes(term)
          || (n.data('fullLabel') || '').toLowerCase().includes(term)
          || (n.data('type') || '').toLowerCase().includes(term)
        if (hit) {
          n.removeClass('cy-search-miss').addClass('cy-search-match')
          n.connectedEdges().removeClass('cy-dimmed-edge').addClass('cy-focused-edge')
        } else {
          n.removeClass('cy-search-match').addClass('cy-search-miss')
        }
      })
    })
  }, [searchTerm])

  // ── Dynamic Theme Switching ──────────────────────────────────────────────
  useEffect(() => {
    const cy = cyRef.current
    if (!cy || cy.destroyed()) return
    cy.style().fromJson(theme === 'space' ? SPACE_STYLES : BASE_STYLES).update()
  }, [theme])

  // Add floating effect
  useEffect(() => {
    const cy = cyRef.current
    if (!cy || theme !== 'space') return

    const interval = setInterval(() => {
      cy.nodes().forEach(node => {
        const p = node.position()
        node.animate({
          position: {
            x: p.x + (Math.random() - 0.5) * 5,
            y: p.y + (Math.random() - 0.5) * 5
          }
        }, { duration: 3000, easing: 'ease-in-out-sine' })
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [cyRef, theme])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          position: 'relative',
          background: theme === 'space' ? 'transparent' : 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%)',
          transition: 'background 0.5s ease-in-out',
        }}
      />
    </div>
  )
})

export default GraphView
