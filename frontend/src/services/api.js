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
export const deleteAccount = () => API.delete('/delete-account');
export const forgotPassword = (email) => API.post('/forgot-password', { email });
export const resetPassword = (data) => API.post('/reset-password', data);

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
export const applyToJob = (jobId, data) => API.post(`/applications/${jobId}/apply`, data);
export const getMyApplications = () => API.get('/applications/my-applications');
export const updateApplicationStatus = (applicationId, status) => API.put(`/applications/${applicationId}/status`, { status });
export const getJobApplicants = (jobId) => API.get(`/jobs/${jobId}/applicants`);

// ========== COMMENTS ==========
export const getJobComments = (jobId) => API.get(`/jobs/${jobId}/comments`);
export const addComment = (jobId, text) => API.post(`/jobs/${jobId}/comments`, { text });
export const deleteComment = (commentId) => API.delete(`/comments/${commentId}`);

// ========== RECOMMENDATIONS ==========
export const getRecommendedJobs = () => API.get('/jobs/recommended');

// ========== NOTIFICATIONS ==========
export const getNotifications = () => API.get('/notifications');
export const markNotificationAsRead = (id) => API.put(`/notifications/${id}/read`);

// ========== SOCIAL FEED ==========
export const createPost = (formData) => API.post('/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getMyPosts = () => API.get('/posts/my-posts');
export const getFeed = () => API.get('/posts/feed');
export const getAllUsers = () => API.get('/users/all');
export const followUser = (id) => API.put(`/users/${id}/follow`);
export const unfollowUser = (id) => API.put(`/users/${id}/unfollow`);
export const likePost = (id) => API.put(`/posts/${id}/like`);
export const addPostComment = (id, text) => API.post(`/posts/${id}/comment`, { text });

export default API;