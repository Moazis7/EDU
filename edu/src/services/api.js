import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getCourses = async () => {
  try {
    const response = await api.get('/upload'); // Matches your backend route
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await api.get(`/upload/${id}`); // Assuming this is the correct endpoint
    return response.data;
  } catch (error) {
    console.error(`Error fetching course with id ${id}:`, error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/category'); // Your backend route for categories
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    // The endpoint matches POST /api/users in your backend
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

export const getAdminStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/users/admin/stats', {
      headers: { 'y-auth-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error.response ? error.response.data : error.message);
    // Return default stats if endpoint doesn't exist
    return {
      totalUsers: 0,
      newUsersToday: 0,
      totalCourses: 0,
      activeCourses: 0,
      totalViews: 0,
      viewsToday: 0,
      totalRevenue: 0,
      revenueToday: 0
    };
  }
};

export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/users/all', {
      headers: { 'y-auth-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to fetch users');
  }
};

export const deleteUser = async (userId) => {
  const token = localStorage.getItem('token');
  return api.delete(`/users/${userId}`, { headers: { 'y-auth-token': token } });
};

export const updateUser = async (userId, data) => {
  const token = localStorage.getItem('token');
  return api.put(`/users/${userId}`, data, { headers: { 'y-auth-token': token } });
};

export const deleteCourse = async (courseId) => {
  const token = localStorage.getItem('token');
  return api.delete(`/upload/${courseId}`, { headers: { 'y-auth-token': token } });
};

export const updateCourse = async (courseId, data) => {
  const token = localStorage.getItem('token');
  return api.put(`/upload/${courseId}`, data, { headers: { 'y-auth-token': token } });
};

export const addCourse = async (data, onProgress) => {
  try {
    const token = localStorage.getItem('token');
    console.log('🔐 Token available:', !!token);
    
    const config = {
      headers: { 
        'y-auth-token': token,
        'Content-Type': 'multipart/form-data' // Important for file uploads
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    };
    
    console.log('🌐 Sending POST request to /upload');
    console.log('📋 Request config:', config);
    
    const response = await api.post('/upload', data, config);
    console.log('✅ Course added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in addCourse:', error);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
};

export const addCategory = async (data) => {
  const token = localStorage.getItem('token');
  return api.post('/category', data, { headers: { 'y-auth-token': token } });
};

export const deleteCategory = async (categoryId) => {
  const token = localStorage.getItem('token');
  return api.delete(`/category/${categoryId}`, { headers: { 'y-auth-token': token } });
};

export const updateCategory = async (categoryId, data) => {
  const token = localStorage.getItem('token');
  return api.put(`/category/${categoryId}`, data, { headers: { 'y-auth-token': token } });
};

export const getCoursesByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/upload/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    return { products: [] };
  }
};

// We can add more functions here for other endpoints
// export const login = (credentials) => api.post('/auth', credentials);

export default api; 