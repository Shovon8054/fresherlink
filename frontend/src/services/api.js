import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== AUTH ==========
export const loginUser = (data) => API.post('/login', data);
export const signupStudent = (data) => API.post('/signup/student', data);
export const signupCompany = (data) => API.post('/signup/company', data);

// ========== PROFILE ==========
export const getProfile = () => API.get('/profile');
export const updateProfile = (data) => API.post('/profile', data);
export const deleteProfileField = (field) => API.delete(`/profile/${field}`);

// ========== JOBS ==========
export const getAllJobs = (params) => API.get('/jobs', { params });
export const getJobById = (id) => API.get(`/jobs/${id}`);
export const createJob = (data) => API.post('/jobs', data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);
export const getCompanyJobs = () => API.get('/company/jobs');

// ========== FAVORITES ==========
export const addFavorite = (jobId) => API.post(`/favorites/${jobId}`);
export const removeFavorite = (jobId) => API.delete(`/favorites/${jobId}`);
export const getFavorites = () => API.get('/favorites');
export const checkFavorite = (jobId) => API.get(`/favorites/check/${jobId}`);

// ========== APPLICATIONS ==========
export const applyToJob = (data) => API.post('/apply', data);
export const getMyApplications = () => API.get('/applications');
export const updateApplicationStatus = (applicationId, status) => API.put(`/applications/${applicationId}/status`, { status });
export const getJobApplicants = (jobId) => API.get(`/jobs/${jobId}/applicants`);

// ========== COMMENTS ==========
export const getJobComments = (jobId) => API.get(`/jobs/${jobId}/comments`);
export const addComment = (jobId, text) => API.post(`/jobs/${jobId}/comments`, { text });
export const deleteComment = (commentId) => API.delete(`/comments/${commentId}`);

// ========== RECOMMENDATIONS ==========
export const getRecommendedJobs = () => API.get('/jobs/recommended');

export default API;