import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

export const fetchTasks = () => api.get('/tasks');
export const createTask = (data) => api.post('/tasks', data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);

export const fetchSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);

// Analytics endpoints
export const fetchProductivityData = (range) => api.get(`/analytics/productivity?range=${range}`);
export const fetchCategoryData = (range) => api.get(`/analytics/category?range=${range}`);
export const fetchTimeDistributionData = (range) => api.get(`/analytics/time-distribution?range=${range}`);
export const fetchHeatmapData = (range) => api.get(`/analytics/heatmap?range=${range}`);
export const fetchCompletionData = (range) => api.get(`/analytics/completion?range=${range}`);
export const fetchStreakData = () => api.get('/analytics/streak');

export default api;
