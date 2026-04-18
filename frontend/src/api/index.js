import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const initializeAgent = async (modelName = 'openai/gpt-3.5-turbo') => {
  const response = await api.post('/initialize_agent', { model_name: modelName });
  return response.data;
};

export const getCases = async (searchTerm = '') => {
  const response = await api.get('/get_cases', { params: { search_term: searchTerm } });
  return response.data;
};

export const createCase = async (caseData) => {
  const response = await api.post('/create_case', caseData);
  return response.data;
};

export const loadCase = async (caseId, name) => {
  const response = await api.post('/load_case', { case_id: caseId, case_name: name });
  return response.data;
};

export const askQuestion = async (question) => {
  const response = await api.post('/ask_question', { question });
  return response.data;
};

export const setLegalReferences = async () => {
  const response = await api.post('/set_legal_references');
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/get_documents');
  return response.data;
};

export const uploadDocument = async (formData) => {
  const response = await api.post('/upload_document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteDocument = async (docId) => {
  const response = await api.delete('/delete_document', { data: { document_id: docId } });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await api.get('/get_chat_history');
  return response.data;
};

export const getClients = async (searchTerm = '') => {
  const response = await api.get('/get_clients', { params: { search_term: searchTerm } });
  return response.data;
};

export default api;
