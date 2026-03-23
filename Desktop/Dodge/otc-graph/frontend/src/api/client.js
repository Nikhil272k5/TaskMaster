import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const api = {
  getGraph: (limit = 200, search = '') => 
    axios.get(`${API_BASE}/graph`, { params: { limit, ...(search ? { search } : {}) } }),

  getStats: () => axios.get(`${API_BASE}/stats`),

  getHealth: () => axios.get(`${API_BASE}/health`),

  chat: (question, conversationHistory = []) =>
    axios.post(`${API_BASE}/chat`, { question, conversation_history: conversationHistory }),

  getNode: (nodeType, nodeId) =>
    axios.get(`${API_BASE}/node/${nodeType}/${nodeId}`),

  testLLM: () => axios.get(`${API_BASE}/llm/test`),
}
