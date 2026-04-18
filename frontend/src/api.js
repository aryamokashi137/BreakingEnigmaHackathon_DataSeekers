import axios from "axios";

const BASE = "http://localhost:8000";

export const getCases = () => axios.get(`${BASE}/cases`);
export const createCase = (case_name, description = "") =>
  axios.post(`${BASE}/cases`, { case_name, description });
export const deleteCase = (caseId) => axios.delete(`${BASE}/cases/${caseId}`);

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
export const clearChat = (caseId) => axios.delete(`${BASE}/chat/${caseId}`);

export const summarizeDocument = (caseId, docName) =>
  axios.post(`${BASE}/summarize/${caseId}/${encodeURIComponent(docName)}`);

export const getDraftTypes = () => axios.get(`${BASE}/draft-types`);
export const generateDraft = (type, data) =>
  axios.post(`${BASE}/generate-draft`, { type, data });

export const buildLifecycle = (caseId, force = false) => axios.post(`${BASE}/case-lifecycle/${caseId}?force=${force}`);
export const getLifecycle = (caseId) => axios.get(`${BASE}/case-lifecycle/${caseId}`);
export const analyzeCase = (caseId) => axios.post(`${BASE}/analyze-case/${caseId}`);

export const extractDeadlines = (caseId) => axios.post(`${BASE}/extract-deadlines/${caseId}`);
export const getTimeline = (caseId) => axios.get(`${BASE}/timeline/${caseId}`);
export const addEvent = (caseId, event) => axios.post(`${BASE}/add-event/${caseId}`, event);
