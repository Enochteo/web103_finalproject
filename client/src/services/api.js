import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get all requests for a student
 * @param {number} userId - The student's user ID
 * @param {object} filters - Optional filters: { search, sortBy, order, status }
 * @returns {Promise} Array of requests
 */
export const getStudentRequests = async (userId, filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.order) params.append('order', filters.order);
  if (filters.status) params.append('status', filters.status);

  const queryString = params.toString();
  const url = `/api/students/${userId}/requests${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response.data;
};

/**
 * Get detailed view of a specific request
 * @param {number} userId - The student's user ID
 * @param {number} requestId - The request ID
 * @returns {Promise} Request details
 */
export const getRequestDetails = async (userId, requestId) => {
  const response = await api.get(`/api/students/${userId}/requests/${requestId}`);
  return response.data;
};

/**
 * Update a request
 * @param {number} userId - The student's user ID
 * @param {number} requestId - The request ID
 * @param {object} updates - Fields to update
 * @returns {Promise} Updated request
 */
export const updateRequest = async (userId, requestId, updates) => {
  const response = await api.patch(`/api/students/${userId}/requests/${requestId}`, updates);
  return response.data;
};

/**
 * Delete a request
 * @param {number} userId - The student's user ID
 * @param {number} requestId - The request ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteRequest = async (userId, requestId) => {
  const response = await api.delete(`/api/students/${userId}/requests/${requestId}`);
  return response.data;
};

export default api;

