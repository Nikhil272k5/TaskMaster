import { useState, useCallback, useRef } from 'react'
import { api } from '../api/client'

// ─── Entity Detection ────────────────────────────────────────────────────────

/**
 * Maps query keywords → Cytoscape node type names.
 * Checked in order; first match wins.
 */
const ENTITY_RULES = [
  { keywords: ['product', 'products', 'material', 'item'],         type: 'Product'      },
  { keywords: ['delivery', 'deliveries', 'shipment', 'shipping'],  type: 'Delivery'     },
  { keywords: ['invoice', 'billing', 'bill', 'billed', 'invoice'], type: 'Billing'      },
  { keywords: ['customer', 'customers', 'client', 'buyer'],        type: 'Customer'     },
  { keywords: ['plant', 'plants', 'warehouse', 'facility'],        type: 'Plant'        },
  { keywords: ['journal', 'accounting', 'ledger', 'gl', 'entry'],  type: 'JournalEntry' },
  { keywords: ['order', 'orders', 'sales order', 'so'],            type: 'SalesOrder'   },
]

function detectEntityType(query) {
  if (!query) return null
  const q = query.toLowerCase()
  for (const rule of ENTITY_RULES) {
    if (rule.keywords.some(kw => q.includes(kw))) return rule.type
  }
  return null
}

// ─── Extract node IDs from answer text ───────────────────────────────────────

function extractNodeIds(text = '', data = []) {
  const ids = new Set()

  // IDs from returned SQL data rows
  const ID_COLUMNS = [
    'salesOrder', 'deliveryDocument', 'billingDocument',
    'businessPartner', 'customer', 'material', 'plant',
    'product', 'accountingDocument',
  ]
  data.forEach(row => {
    ID_COLUMNS.forEach(col => {
      if (row[col]) ids.add(String(row[col]))
    })
  })

  // IDs from answer text: 6-8 digit numeric IDs
  const matches = text.match(/\b\d{6,10}\b/g) || []
  matches.forEach(m => ids.add(m))

  return [...ids].slice(0, 30)
}

// ─── useChat hook ─────────────────────────────────────────────────────────────

export function useChat({ onHighlight, onFocusType } = {}) {
  const [messages, setMessages]   = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const historyRef                = useRef([])   // rolling conversation context

  const sendMessage = useCallback(async (question) => {
    if (!question?.trim()) return

    // 1. Detect entity type and animate graph BEFORE waiting for AI
    const entityType = detectEntityType(question)
    if (entityType && onFocusType) {
      onFocusType(entityType)
    }

    // 2. Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setIsLoading(true)

    try {
      // 3. Build conversation history for context
      const history = historyRef.current.slice(-6)   // last 3 turns

      const { data } = await api.chat(question, history)

      const answer = data.answer || 'No response'
      const nodeIds = extractNodeIds(answer, data.data || [])

      // 4. Add AI message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: answer,
        sql: data.sql,
        data: data.data,
        row_count: data.row_count,
        highlighted_nodes: nodeIds,
      }])

      // 5. Highlight nodes in graph
      if (nodeIds.length > 0 && onHighlight) {
        onHighlight(nodeIds)
      }

      // 6. Update rolling conversation history
      historyRef.current = [
        ...historyRef.current,
        { role: 'user', content: question },
        { role: 'assistant', content: answer },
      ].slice(-10)

    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Network error'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Something went wrong: ${msg}. Please try again.`,
      }])
    } finally {
      setIsLoading(false)
    }
  }, [onHighlight, onFocusType])

  const clearChat = useCallback(() => {
    setMessages([])
    historyRef.current = []
  }, [])

  return { messages, isLoading, sendMessage, clearChat }
}
