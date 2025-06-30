import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
    const response = await api.get('/users/admin/stats');
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
    const response = await api.get('/users/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to fetch users');
  }
};

export const deleteUser = async (userId) => {
  return api.delete(`/users/${userId}`);
};

export const updateUser = async (userId, data) => {
  return api.put(`/users/${userId}`, data);
};

export const deleteCourse = async (courseId) => {
  return api.delete(`/upload/${courseId}`);
};

export const updateCourse = async (courseId, data) => {
  return api.put(`/upload/${courseId}`, data);
};

export const addCourse = async (data, onProgress) => {
  try {
    const config = {
      headers: { 
        'Content-Type': 'multipart/form-data' // Important for file uploads
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    };
    
    const response = await api.post('/upload', data, config);
    return response.data;
  } catch (error) {
    console.error('❌ Error in addCourse:', error);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
};

export const addCategory = async (data) => {
  return api.post('/category', data);
};

export const deleteCategory = async (categoryId) => {
  return api.delete(`/category/${categoryId}`);
};

export const updateCategory = async (categoryId, data) => {
  return api.put(`/category/${categoryId}`, data);
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