import axios from 'axios';

// 在开发环境使用本地后端，在生产环境（如 Railway）使用相对路径 /api
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:3001/api'
    : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scenariosAPI = {
  getAll: () => api.get('/scenarios'),
  getById: (id) => api.get(`/scenarios/${id}`),
};

export const resultsAPI = {
  submit: (candidateId, answers) => 
    api.post('/results/submit', { candidate_id: candidateId, answers }),
  getByCandidateId: (candidateId) => 
    api.get(`/results/${candidateId}`),
  getAll: () => api.get('/results'),
  delete: (candidateId) => 
    api.delete(`/results/${candidateId}`),
};

export const candidatesAPI = {
  startTest: (candidateId) => 
    api.post(`/candidates/${candidateId}/start`),
  submitAnswer: (candidateId, scenarioId, optionId) => 
    api.post(`/candidates/${candidateId}/answer`, {
      scenario_id: scenarioId,
      option_id: optionId,
    }),
};

export default api;

