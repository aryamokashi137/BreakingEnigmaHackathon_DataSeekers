import axios from "axios";

const BASE = "http://localhost:8000";

export const getCases = () => axios.get(`${BASE}/cases`);
export const createCase = (case_name, description = "") =>
  axios.post(`${BASE}/cases`, { case_name, description });

export const getDocuments = (caseId) => axios.get(`${BASE}/documents/${caseId}`);
export const uploadDocument = (caseId, file) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post(`${BASE}/upload/${caseId}`, form);
};
export const deleteDocument = (docId) => axios.delete(`${BASE}/documents/${docId}`);

export const getChatHistory = (caseId) => axios.get(`${BASE}/chat/${caseId}`);
export const sendMessage = (caseId, message) =>
  axios.post(`${BASE}/chat`, { case_id: caseId, message });

export const summarizeDocument = (caseId, docName) =>
  axios.post(`${BASE}/summarize/${caseId}/${encodeURIComponent(docName)}`);
