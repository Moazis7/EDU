import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import { FaUsers, FaBook, FaLayerGroup, FaDatabase, FaUserEdit, FaTrash, FaPlus, FaEye, FaDownload, FaVideo, FaFile, FaChartLine, FaCalendarAlt, FaStar, FaSave } from 'react-icons/fa';
import { getAdminStats, getAllUsers, getCourses, getCategories, deleteUser, updateUser, deleteCourse, updateCourse, addCourse, addCategory, deleteCategory, updateCategory } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    thumbnail: null,
    video: null
  });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [courseError, setCourseError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  // Editing states
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editCourseData, setEditCourseData] = useState({});
  const [editUserData, setEditUserData] = useState({});
  const [editSubcategoryData, setEditSubcategoryData] = useState({});

  // Course filtering and organization
  const [courseFilter, setCourseFilter] = useState('all'); // 'all', 'level', 'category', 'combined'
  const [selectedFilterLevel, setSelectedFilterLevel] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('');
  const [showCourseFilters, setShowCourseFilters] = useState(false);
  const [combinedFilter, setCombinedFilter] = useState(false); // للفلترة المجمعة
  const [videoPreview, setVideoPreview] = useState(null); // للـ video preview

  // Predefined educational levels
  const educationalLevels = [
    { id: 'prep1', name: 'الصف الأول الإعدادي', arabicName: 'الصف الأول الإعدادي' },
    { id: 'prep2', name: 'الصف الثاني الإعدادي', arabicName: 'الصف الثاني الإعدادي' },
    { id: 'prep3', name: 'الصف الثالث الإعدادي', arabicName: 'الصف الثالث الإعدادي' },
    { id: 'sec1', name: 'الصف الأول الثانوي', arabicName: 'الصف الأول الثانوي' },
    { id: 'sec2', name: 'الصف الثاني الثانوي', arabicName: 'الصف الثاني الثانوي' },
    { id: 'sec3', name: 'الصف الثالث الثانوي', arabicName: 'الصف الثالث الثانوي' }
  ];

  const [selectedLevel, setSelectedLevel] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState({ name: '', description: '', image: null });
  const [subcategoryError, setSubcategoryError] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [showCoursesModal, setShowCoursesModal] = useState(false);

  // Default subcategories for each level (examples)
  const defaultSubcategories = {
    prep1: [
      { name: 'الرياضيات', description: 'مادة الرياضيات للصف الأول الإعدادي' },
      { name: 'اللغة العربية', description: 'مادة اللغة العربية للصف الأول الإعدادي' },
      { name: 'اللغة الإنجليزية', description: 'مادة اللغة الإنجليزية للصف الأول الإعدادي' },
      { name: 'العلوم', description: 'مادة العلوم للصف الأول الإعدادي' }
    ],
    prep2: [
      { name: 'الرياضيات', description: 'مادة الرياضيات للصف الثاني الإعدادي' },
      { name: 'اللغة العربية', description: 'مادة اللغة العربية للصف الثاني الإعدادي' },
      { name: 'اللغة الإنجليزية', description: 'مادة اللغة الإنجليزية للصف الثاني الإعدادي' },
      { name: 'العلوم', description: 'مادة العلوم للصف الثاني الإعدادي' }
    ],
    prep3: [
      { name: 'الرياضيات', description: 'مادة الرياضيات للصف الثالث الإعدادي' },
      { name: 'اللغة العربية', description: 'مادة اللغة العربية للصف الثالث الإعدادي' },
      { name: 'اللغة الإنجليزية', description: 'مادة اللغة الإنجليزية للصف الثالث الإعدادي' },
      { name: 'العلوم', description: 'مادة العلوم للصف الثالث الإعدادي' }
    ],
    sec1: [
      { name: 'الرياضيات', description: 'مادة الرياضيات للصف الأول الثانوي' },
      { name: 'اللغة العربية', description: 'مادة اللغة العربية للصف الأول الثانوي' },
      { name: 'اللغة الإنجليزية', description: 'مادة اللغة الإنجليزية للصف الأول الثانوي' },
      { name: 'الفيزياء', description: 'مادة الفيزياء للصف الأول الثانوي' },
      { name: 'الكيمياء', description: 'مادة الكيمياء للصف الأول الثانوي' },
      { name: 'الأحياء', description: 'مادة الأحياء للصف الأول الثانوي' }
    ],
    sec2: [
      { name: 'الرياضيات', description: 'مادة الرياضيات للصف الثاني الثانوي' },
      { name: 'اللغة العربية', description: 'مادة اللغة العربية للصف الثاني الثانوي' },
      { name: 'اللغة الإنجليزية', description: 'مادة اللغة الإنجليزية للصف الثاني الثانوي' },
      { name: 'الفيزياء', description: 'مادة الفيزياء للصف الثاني الثانوي' },
      { name: 'الكيمياء', description: 'مادة الكيمياء للصف الثاني الثانوي' },
      { name: 'الأحياء', description: 'مادة الأحياء للصف الثاني الثانوي' }
    ],
    sec3: [
      { name: 'الرياضيات', description: 'مادة الرياضيات للصف الثالث الثانوي' },
      { name: 'اللغة العربية', description: 'مادة اللغة العربية للصف الثالث الثانوي' },
      { name: 'اللغة الإنجليزية', description: 'مادة اللغة الإنجليزية للصف الثالث الثانوي' },
      { name: 'الفيزياء', description: 'مادة الفيزياء للصف الثالث الثانوي' },
      { name: 'الكيمياء', description: 'مادة الكيمياء للصف الثالث الثانوي' },
      { name: 'الأحياء', description: 'مادة الأحياء للصف الثالث الثانوي' }
    ]
  };

  // Check authentication on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    console.log('🔐 AdminPanel - Checking authentication:', { user, hasToken: !!token });
    
    if (!token || !user || user.role !== 'admin') {
      console.log('❌ AdminPanel - Access denied:', { hasToken: !!token, userRole: user?.role });
      alert('Access denied. Admin privileges required.');
      navigate('/login');
      return;
    }
    
    console.log('✅ AdminPanel - Authentication passed');
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      
      if (!token || !user || user.role !== 'admin') {
        console.log('❌ AdminPanel - Cannot fetch data, not authenticated as admin');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch data separately to handle errors individually
        let statsData = {};
        let usersData = [];
        let coursesData = [];
        let categoriesData = [];

        try {
          console.log('📊 Fetching admin stats...');
          statsData = await getAdminStats();
          console.log('✅ Admin stats fetched:', statsData);
        } catch (err) {
          console.log('❌ Stats not available, using defaults:', err.message);
          statsData = {
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

        try {
          console.log('👥 Fetching users...');
          const usersResponse = await getAllUsers();
          usersData = usersResponse.users || usersResponse || [];
          console.log('✅ Users fetched:', usersData.length);
        } catch (err) {
          console.log('❌ Users not available:', err.message);
          usersData = [];
        }

        try {
          console.log('📚 Fetching courses...');
          const coursesResponse = await getCourses();
          coursesData = coursesResponse.products || coursesResponse || [];
          console.log('✅ Courses fetched:', coursesData.length);
        } catch (err) {
          console.log('❌ Courses not available:', err.message);
          coursesData = [];
        }

        try {
          console.log('📂 Fetching categories...');
          categoriesData = await getCategories();
          console.log('✅ Categories fetched:', categoriesData.length);
        } catch (err) {
          console.log('❌ Categories not available:', err.message);
          categoriesData = [];
        }
        
        setStats(statsData);
        setUsers(usersData);
        setCourses(coursesData);
        setCategories(categoriesData);
        setSubcategories(categoriesData);
        setError('');
      } catch (err) {
        console.error('❌ Error loading admin data:', err);
        setError('Failed to load admin data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (courses && Array.isArray(courses)) {
      courses.forEach(course => {
        if (course.video) {
          console.log(`🔗 Video URL for course ${course.title}:`, course.video);
        }
      });
    }
  }, [courses]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (err) {
      alert('Failed to delete course.');
    }
  };

  // Edit Course Functions
  const handleEditCourse = (course) => {
    setEditingCourse(course._id);
    setEditCourseData({
      title: course.title || '',
      description: course.description || '',
      category: course.category?._id || course.category || '',
      price: course.price || '',
      level: course.level || ''
    });
  };

  const handleUpdateCourse = async (courseId) => {
    try {
      const response = await updateCourse(courseId, editCourseData);
      
      // تحديث الكورس في القائمة مع البيانات المحدثة
      const updatedCourse = response.data.course || response.data;
      
      // إذا لم يكن category populated، نقوم بتحديثه يدوياً
      if (updatedCourse && !updatedCourse.category?.name && editCourseData.category) {
        const category = subcategories.find(cat => cat._id === editCourseData.category);
        if (category) {
          updatedCourse.category = category;
        }
      }
      
      setCourses(courses.map(c => c._id === courseId ? updatedCourse : c));
      
      setEditingCourse(null);
      setEditCourseData({});
    } catch (err) {
      alert('Failed to update course.');
    }
  };

  const handleCancelEditCourse = () => {
    setEditingCourse(null);
    setEditCourseData({});
  };

  // Edit User Functions
  const handleEditUser = (user) => {
    setEditingUser(user._id);
    setEditUserData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      governorate: user.governorate || '',
      role: user.role || 'user'
    });
  };

  const handleUpdateUser = async (userId) => {
    try {
      const response = await updateUser(userId, editUserData);
      setUsers(users.map(u => u._id === userId ? response.data : u));
      setEditingUser(null);
      setEditUserData({});
    } catch (err) {
      alert('Failed to update user.');
    }
  };

  const handleCancelEditUser = () => {
    setEditingUser(null);
    setEditUserData({});
  };

  // Edit Subcategory Functions
  const handleEditSubcategory = (subcategory) => {
    setEditingSubcategory(subcategory._id);
    setEditSubcategoryData({
      name: subcategory.name || '',
      description: subcategory.description || '',
      level: subcategory.level || ''
    });
  };

  const handleUpdateSubcategory = async (subcategoryId) => {
    try {
      const response = await updateCategory(subcategoryId, editSubcategoryData);
      setSubcategories(subcategories.map(s => s._id === subcategoryId ? response.data : s));
      setCategories(categories.map(c => c._id === subcategoryId ? response.data : c));
      setEditingSubcategory(null);
      setEditSubcategoryData({});
    } catch (err) {
      alert('Failed to update subcategory.');
    }
  };

  const handleCancelEditSubcategory = () => {
    setEditingSubcategory(null);
    setEditSubcategoryData({});
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    const file = files[0];
    
    if (!file) return;
    
    // File size validation
    const maxImageSize = 5 * 1024 * 1024; // 5MB for images
    const maxVideoSize = 100 * 1024 * 1024; // 100MB for videos
    
    // File type validation with more strict checking
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
    
    if (type === 'thumbnail') {
      // Check file extension as well as MIME type
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!allowedImageTypes.includes(file.type) || !validExtensions.includes(fileExtension)) {
        alert(`Please select a valid image file (JPEG, PNG, GIF, WebP).\nSelected file: ${file.name}\nDetected type: ${file.type}\nExtension: ${fileExtension}`);
        e.target.value = '';
        return;
      }
      
      // Check if file is empty
      if (file.size === 0) {
        alert('Selected image file is empty. Please choose a valid image file.');
        e.target.value = '';
        return;
      }
      
      if (file.size > maxImageSize) {
        alert(`Image size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB\n\n💡 Tip: Try compressing your image or using a smaller file.`);
        e.target.value = '';
        return;
      }
      
      console.log('✅ Valid image selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`, `Type: ${file.type}`);
      setNewCourse({ ...newCourse, thumbnail: file });
      
    } else if (type === 'video') {
      // Check file extension as well as MIME type
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const validExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
      
      if (!allowedVideoTypes.includes(file.type) || !validExtensions.includes(fileExtension)) {
        alert(`Please select a valid video file (MP4, AVI, MOV, WMV, FLV, WebM).\nSelected file: ${file.name}\nDetected type: ${file.type}\nExtension: ${fileExtension}`);
        e.target.value = '';
        return;
      }
      
      // Check if file is empty
      if (file.size === 0) {
        alert('Selected video file is empty. Please choose a valid video file.');
        e.target.value = '';
        return;
      }
      
      if (file.size > maxVideoSize) {
        alert(`Video size must be less than 100MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB\n\n💡 Note: Videos over 7MB will be automatically compressed.`);
        e.target.value = '';
        return;
      }
      
      console.log('✅ Valid video selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`, `Type: ${file.type}`);
      setNewCourse({ ...newCourse, video: file });
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setCourseError('');
    setIsAddingCourse(true);
    
    console.log('🚀 Starting course addition...');
    console.log('📝 Course data:', newCourse);
    
    if (!newCourse.title || !newCourse.category || !newCourse.price || !newCourse.level) {
      const missingFields = [];
      if (!newCourse.title) missingFields.push('Title');
      if (!newCourse.category) missingFields.push('Category');
      if (!newCourse.price) missingFields.push('Price');
      if (!newCourse.level) missingFields.push('Level');
      
      setCourseError(`Missing required fields: ${missingFields.join(', ')}`);
      console.log('❌ Missing fields:', missingFields);
      setIsAddingCourse(false);
      return;
    }

    try {
      console.log('📦 Creating FormData...');
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('description', newCourse.description || '');
      formData.append('category', newCourse.category);
      formData.append('level', newCourse.level);
      formData.append('price', newCourse.price);
      
      if (newCourse.thumbnail) {
        console.log('🖼️ Adding thumbnail:', newCourse.thumbnail.name);
        formData.append('thumbnail', newCourse.thumbnail);
      }
      if (newCourse.video) {
        console.log('🎥 Adding video:', newCourse.video.name);
        formData.append('video', newCourse.video);
        
        // Show compression notice if video is large
        const videoSizeMB = newCourse.video.size / (1024 * 1024);
        if (videoSizeMB > 9) {
          console.log(`📹 Video size (${videoSizeMB.toFixed(2)}MB) will be automatically compressed`);
        }
      }

      // Log FormData contents
      console.log('📋 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log('🌐 Sending request to API...');
      
      // Progress tracking function
      const handleProgress = (progress) => {
        setUploadProgress(progress);
        
        // Determine status based on progress and file types
        if (progress < 100) {
          const hasLargeVideo = newCourse.video && (newCourse.video.size / 1024 / 1024) > 9;
          const hasLargeImage = newCourse.thumbnail && (newCourse.thumbnail.size / 1024 / 1024) > 4;
          
          if (hasLargeVideo) {
            if (progress < 30) {
              setUploadStatus('Compressing video...');
            } else if (progress < 80) {
              setUploadStatus('Uploading files...');
            } else {
              setUploadStatus('Finalizing...');
            }
          } else if (hasLargeImage) {
            if (progress < 50) {
              setUploadStatus('Processing image...');
            } else {
              setUploadStatus('Uploading...');
            }
          } else {
            setUploadStatus('Uploading...');
          }
        } else {
          setUploadStatus('Processing...');
        }
      };
      
      const response = await addCourse(formData, handleProgress);
      console.log('✅ Course added successfully:', response);
      
      // Check if video was processed
      const videoSizeMB = newCourse.video ? newCourse.video.size / (1024 * 1024) : 0;
      if (videoSizeMB > 9) {
        console.log('📹 Large video was processed and compressed automatically');
      }
      
      // Refresh courses list
      console.log('🔄 Refreshing courses list...');
      const updatedCourses = await getCourses();
      setCourses(updatedCourses.products || updatedCourses);
      
      // Reset form
      setShowAddCourse(false);
      setNewCourse({
        title: '', 
        description: '', 
        category: '', 
        price: '',
        level: '',
        thumbnail: null, 
        video: null
      });
      
      console.log('✅ Course addition completed successfully');
      
      // Show success message
      if (videoSizeMB > 9) {
        alert('✅ Course added successfully!\n\n📹 Your large video was automatically compressed and uploaded to Cloudinary.');
      } else {
        alert('✅ Course added successfully!');
      }
      
      // Reset progress
      setUploadProgress(0);
      setUploadStatus('');
    } catch (err) {
      console.error('❌ Error adding course:', err);
      console.error('❌ Error response:', err.response?.data);
      
      // Handle specific Cloudinary errors
      let errorMessage = err.response?.data?.message || err.message;
      
      if (errorMessage.includes('File too large') || errorMessage.includes('10MB')) {
        errorMessage = `File too large for Cloudinary free plan. Maximum size is 10MB. Please compress your files or use smaller ones.\n\n💡 Tip: Videos over 7MB are automatically compressed, but some files may still be too large.`;
      } else if (errorMessage.includes('bandwidth') || errorMessage.includes('quota')) {
        errorMessage = `Cloudinary bandwidth or storage quota exceeded. Please try again later or upgrade your plan.`;
      } else if (errorMessage.includes('compression')) {
        errorMessage = `Video compression failed. Please try with a smaller video file or compress it manually.`;
      } else if (errorMessage.includes('Invalid image file') || errorMessage.includes('corrupted')) {
        errorMessage = `The uploaded image file is corrupted or invalid. Please try with a different image file.\n\n💡 Tip: Make sure the image file is not corrupted and try using a different image.`;
      } else if (errorMessage.includes('File format not supported')) {
        errorMessage = `File format not supported. Please use JPEG, PNG, GIF, or WebP for images.\n\n💡 Tip: Convert your image to a supported format before uploading.`;
      } else if (errorMessage.includes('Invalid file extension')) {
        errorMessage = `Invalid file extension. Please use JPEG, PNG, GIF, or WebP files.\n\n💡 Tip: Make sure your file has the correct extension (.jpg, .png, .gif, .webp).`;
      }
      
      setCourseError(errorMessage);
      
      // Reset progress on error
      setUploadProgress(0);
      setUploadStatus('');
    } finally {
      setIsAddingCourse(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');
    
    if (!newCategory.name) {
      setCategoryError('Category name is required.');
      return;
    }

    try {
      await addCategory(newCategory);
      setShowAddCategory(false);
      setNewCategory({ name: '', description: '' });
      // Refresh categories
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      setSubcategories(updatedCategories);
    } catch (err) {
      setCategoryError('Failed to add category.');
    }
  };

  const handleAddDefaultSubcategories = async () => {
    if (!window.confirm('This will add default subjects for all educational levels. Continue?')) return;
    
    try {
      for (const levelId of Object.keys(defaultSubcategories)) {
        for (const subject of defaultSubcategories[levelId]) {
          const formData = new FormData();
          formData.append('name', subject.name);
          formData.append('description', subject.description);
          formData.append('level', levelId);
          
          await addCategory(formData);
        }
      }
      
      // Refresh categories
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      setSubcategories(updatedCategories);
      alert('Default subjects added successfully!');
    } catch (err) {
      alert('Failed to add default subjects. Some may already exist.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter(cat => cat._id !== categoryId));
      setSubcategories(subcategories.filter(sub => sub._id !== categoryId));
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  const handleSubcategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSubcategory({ ...newSubcategory, image: file });
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    setSubcategoryError('');
    
    if (!newSubcategory.name || !selectedLevel) {
      setSubcategoryError('Name and level are required.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newSubcategory.name);
      formData.append('description', newSubcategory.description);
      formData.append('level', selectedLevel);
      if (newSubcategory.image) {
        formData.append('image', newSubcategory.image);
      }

      await addCategory(formData);
      setShowAddSubcategory(false);
      setNewSubcategory({ name: '', description: '', image: null });
      // Refresh categories
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      setSubcategories(updatedCategories);
    } catch (err) {
      setSubcategoryError('Failed to add subcategory.');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await deleteCategory(subcategoryId);
      setSubcategories(subcategories.filter(sub => sub._id !== subcategoryId));
      setCategories(categories.filter(cat => cat._id !== subcategoryId));
    } catch (err) {
      alert('Failed to delete subcategory.');
    }
  };

  const handleLevelChange = (levelId) => {
    setSelectedLevel(levelId);
    // Filter subcategories for selected level
    const levelSubcategories = categories.filter(cat => cat.level === levelId);
    setSubcategories(levelSubcategories);
  };

  const handleViewCourses = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setShowCoursesModal(true);
  };

  const closeCoursesModal = () => {
    setSelectedSubcategory(null);
    setShowCoursesModal(false);
  };

  const getCoursesForSubcategory = (subcategory) => {
    return courses.filter(course => {
      const courseCategoryId = course.category?._id || course.category;
      return courseCategoryId === subcategory._id;
    });
  };

  // Course organization functions
  const getFilteredCourses = () => {
    let filtered = courses;

    if (courseFilter === 'level' && selectedFilterLevel) {
      filtered = courses.filter(course => course.level === selectedFilterLevel);
    } else if (courseFilter === 'category' && selectedFilterCategory) {
      filtered = courses.filter(course => {
        const courseCategoryId = course.category?._id || course.category;
        return courseCategoryId === selectedFilterCategory;
      });
    } else if (courseFilter === 'combined') {
      // فلترة مجمعة: المستوى + المادة
      if (selectedFilterLevel && selectedFilterCategory) {
        filtered = courses.filter(course => {
          const courseCategoryId = course.category?._id || course.category;
          return course.level === selectedFilterLevel && courseCategoryId === selectedFilterCategory;
        });
      } else if (selectedFilterLevel) {
        filtered = courses.filter(course => course.level === selectedFilterLevel);
      } else if (selectedFilterCategory) {
        filtered = courses.filter(course => {
          const courseCategoryId = course.category?._id || course.category;
          return courseCategoryId === selectedFilterCategory;
        });
      }
    }

    return filtered;
  };

  const getCoursesByLevel = () => {
    const coursesByLevel = {};
    
    courses.forEach(course => {
      const level = course.level || 'unknown';
      if (!coursesByLevel[level]) {
        coursesByLevel[level] = [];
      }
      coursesByLevel[level].push(course);
    });

    return coursesByLevel;
  };

  const getCoursesByCategory = () => {
    const coursesByCategory = {};
    
    courses.forEach(course => {
      const categoryId = course.category?._id || course.category || 'unknown';
      const categoryName = getCategoryName(categoryId);
      
      if (!coursesByCategory[categoryId]) {
        coursesByCategory[categoryId] = {
          name: categoryName,
          courses: []
        };
      }
      coursesByCategory[categoryId].courses.push(course);
    });

    return coursesByCategory;
  };

  const getCategoryName = (categoryId) => {
    const category = subcategories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getCombinedCourses = () => {
    const combinedCourses = {};
    
    courses.forEach(course => {
      const level = course.level || 'unknown';
      const categoryId = course.category?._id || course.category || 'unknown';
      const categoryName = getCategoryName(categoryId);
      
      if (!combinedCourses[level]) {
        combinedCourses[level] = {};
      }
      
      if (!combinedCourses[level][categoryId]) {
        combinedCourses[level][categoryId] = {
          name: categoryName,
          courses: []
        };
      }
      
      combinedCourses[level][categoryId].courses.push(course);
    });

    return combinedCourses;
  };

  const clearFilters = () => {
    setCourseFilter('all');
    setSelectedFilterLevel('');
    setSelectedFilterCategory('');
    setCombinedFilter(false);
  };

  if (loading) return (
    <div className="admin-loading">
      <div className="loading-spinner"></div>
      <p>Loading admin panel...</p>
    </div>
  );
  
  if (error) return (
    <div className="admin-error-container">
      <h2>Error Loading Admin Panel</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="retry-btn">
        Retry
      </button>
    </div>
  );

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your educational platform</p>
      </div>

      {/* Statistics Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon users">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers || 0}</h3>
            <p>Total Users</p>
            <small>{stats.newUsersToday || 0} new today</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon courses">
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>{stats.totalCourses || 0}</h3>
            <p>Total Courses</p>
            <small>{stats.activeCourses || 0} active</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon views">
            <FaEye />
          </div>
          <div className="stat-content">
            <h3>{stats.totalViews || 0}</h3>
            <p>Total Views</p>
            <small>{stats.viewsToday || 0} today</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon revenue">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>${stats.totalRevenue || 0}</h3>
            <p>Total Revenue</p>
            <small>${stats.revenueToday || 0} today</small>
          </div>
        </div>
      </div>

      {/* Categories Management */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          Educational Categories 
          <div className="admin-actions">
            <button className="admin-action-btn add" onClick={() => setShowAddSubcategory(!showAddSubcategory)}>
              <FaPlus />
            </button>
            {categories.length === 0 && (
              <button className="admin-action-btn add-default" onClick={handleAddDefaultSubcategories}>
                Add Default Subjects
              </button>
            )}
          </div>
        </h2>
        
        {showAddSubcategory && (
          <form className="admin-add-subcategory-form" onSubmit={handleAddSubcategory}>
            <div className="form-header">
              <h3>Add New Subject Category</h3>
              <p>Add a new subject category for a specific educational level</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Educational Level *</label>
                <select 
                  value={selectedLevel} 
                  onChange={(e) => handleLevelChange(e.target.value)}
                  required
                >
                  <option value="">Select Educational Level</option>
                  {educationalLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.arabicName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subject Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g., الرياضيات، اللغة العربية" 
                  value={newSubcategory.name} 
                  onChange={e => setNewSubcategory({ ...newSubcategory, name: e.target.value })} 
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                placeholder="Describe this subject category" 
                value={newSubcategory.description} 
                onChange={e => setNewSubcategory({ ...newSubcategory, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label><FaFile /> Subject Icon</label>
              <p className="field-hint">Upload an icon for this subject (optional)</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleSubcategoryImageChange} 
              />
              {newSubcategory.image && (
                <div className="file-preview">
                  <img src={URL.createObjectURL(newSubcategory.image)} alt="Icon preview" />
                  <span className="file-name">{newSubcategory.image.name}</span>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                <FaPlus /> Add Subject
              </button>
              <button type="button" className="cancel-btn" onClick={() => setShowAddSubcategory(false)}>
                Cancel
              </button>
            </div>
            
            {subcategoryError && <div className="admin-error">{subcategoryError}</div>}
          </form>
        )}

        {/* Educational Levels Grid */}
        <div className="educational-levels-grid">
          {educationalLevels.map(level => (
            <div key={level.id} className="level-card">
              <div className="level-header">
                <h3>{level.arabicName}</h3>
                <span className="level-id">{level.name}</span>
              </div>
              
              <div className="subcategories-grid">
                {subcategories.filter(sub => sub.level === level.id).map(subcategory => {
                  // Count courses for this subcategory
                  const courseCount = courses.filter(course => 
                    course.category === subcategory._id || course.category === subcategory.name
                  ).length;
                  
                  return (
                    <div key={subcategory._id} className="subcategory-card">
                      <div className="subcategory-header">
                        {subcategory.image && (
                          <img src={subcategory.image} alt={subcategory.name} className="subcategory-icon" />
                        )}
                        <div className="subcategory-info">
                          {editingSubcategory === subcategory._id ? (
                            <div className="edit-subcategory-fields">
                              <input
                                type="text"
                                value={editSubcategoryData.name || ''}
                                onChange={(e) => setEditSubcategoryData({...editSubcategoryData, name: e.target.value})}
                                className="edit-input"
                                placeholder="اسم المادة"
                              />
                              <textarea
                                value={editSubcategoryData.description || ''}
                                onChange={(e) => setEditSubcategoryData({...editSubcategoryData, description: e.target.value})}
                                className="edit-textarea"
                                placeholder="وصف المادة"
                                rows="2"
                              />
                            </div>
                          ) : (
                            <>
                              <h4>{subcategory.name}</h4>
                              <p>{subcategory.description}</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="subcategory-stats">
                        <div className="course-count">
                          <FaBook />
                          <span>{courseCount} كورس</span>
                        </div>
                      </div>
                      
                      <div className="subcategory-actions">
                        <button 
                          className="admin-action-btn view" 
                          onClick={() => handleViewCourses(subcategory)}
                          title="عرض الكورسات"
                        >
                          <FaEye />
                        </button>
                        {editingSubcategory === subcategory._id ? (
                          <div className="edit-actions">
                            <button 
                              className="admin-action-btn save" 
                              onClick={() => handleUpdateSubcategory(subcategory._id)}
                              title="حفظ"
                            >
                              <FaSave />
                            </button>
                            <button 
                              className="admin-action-btn cancel" 
                              onClick={handleCancelEditSubcategory}
                              title="إلغاء"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="admin-action-btn edit" 
                            onClick={() => handleEditSubcategory(subcategory)}
                            title="تعديل"
                          >
                            <FaUserEdit />
                          </button>
                        )}
                        <button 
                          className="admin-action-btn delete" 
                          onClick={() => handleDeleteSubcategory(subcategory._id)} 
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {subcategories.filter(sub => sub.level === level.id).length === 0 && (
                  <div className="empty-subcategories">
                    <p>لا توجد مواد مضافة بعد</p>
                    <small>اضغط على زر + أعلاه لإضافة المواد</small>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Course Management */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          Courses 
          <div className="admin-actions">
            <button 
              className="admin-action-btn filter" 
              onClick={() => setShowCourseFilters(!showCourseFilters)}
              title="Filter Courses"
            >
              🔍 Filter
            </button>
            <button className="admin-action-btn add" onClick={() => setShowAddCourse(!showAddCourse)}>
              <FaPlus />
            </button>
          </div>
        </h2>

        {/* Course Filters */}
        {showCourseFilters && (
          <div className="course-filters">
            <div className="filter-controls">
              <div className="filter-group">
                <label>Filter by:</label>
                <select 
                  value={courseFilter} 
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Courses</option>
                  <option value="level">Educational Level</option>
                  <option value="category">Subject Category</option>
                  <option value="combined">Combined Level and Category</option>
                </select>
              </div>

              {courseFilter === 'level' && (
                <div className="filter-group">
                  <label>Select Level:</label>
                  <select 
                    value={selectedFilterLevel} 
                    onChange={(e) => setSelectedFilterLevel(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Levels</option>
                    {educationalLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.arabicName}</option>
                    ))}
                  </select>
                </div>
              )}

              {courseFilter === 'category' && (
                <div className="filter-group">
                  <label>Select Category:</label>
                  <select 
                    value={selectedFilterCategory} 
                    onChange={(e) => setSelectedFilterCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Categories</option>
                    {subcategories.map(category => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {courseFilter === 'combined' && (
                <>
                  <div className="filter-group">
                    <label>Select Level:</label>
                    <select 
                      value={selectedFilterLevel} 
                      onChange={(e) => setSelectedFilterLevel(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Select Level</option>
                      {educationalLevels.map(level => (
                        <option key={level.id} value={level.id}>{level.arabicName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Select Category:</label>
                    <select 
                      value={selectedFilterCategory} 
                      onChange={(e) => setSelectedFilterCategory(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Select Category</option>
                      {subcategories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-info">
                    <small>
                      💡 Select both Level and Category to filter courses that belong to both, 
                      or select only one to filter by that criterion.
                    </small>
                  </div>
                </>
              )}

              <button 
                className="clear-filters-btn" 
                onClick={clearFilters}
                disabled={courseFilter === 'all'}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Course Organization Tabs */}
        <div className="course-organization-tabs">
          <button 
            className={`org-tab ${courseFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCourseFilter('all')}
          >
            All Courses ({courses.length})
          </button>
          <button 
            className={`org-tab ${courseFilter === 'level' ? 'active' : ''}`}
            onClick={() => setCourseFilter('level')}
          >
            By Level
          </button>
          <button 
            className={`org-tab ${courseFilter === 'category' ? 'active' : ''}`}
            onClick={() => setCourseFilter('category')}
          >
            By Category
          </button>
          <button 
            className={`org-tab ${courseFilter === 'combined' ? 'active' : ''}`}
            onClick={() => setCourseFilter('combined')}
          >
            Combined View
          </button>
        </div>

        {/* Course Display Based on Organization */}
        {courseFilter === 'all' && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Level</th>
                  <th>Subject</th>
                  <th>Price</th>
                  <th>Video</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredCourses().length > 0 ? (
                  getFilteredCourses().map(course => (
                    <tr key={course._id}>
                      <td>
                        {course.thumbnail && (
                          <div className="thumbnail-container">
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="course-thumbnail"
                              onClick={() => setVideoPreview(course.video)}
                            />
                            {course.video && (
                              <button 
                                className="play-preview-btn"
                                onClick={() => setVideoPreview(course.video)}
                                title="Play Video"
                              >
                                ▶️
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {editingCourse === course._id ? (
                          <div className="edit-row">
                            <input
                              type="text"
                              value={editCourseData.title || ''}
                              onChange={(e) => setEditCourseData({...editCourseData, title: e.target.value})}
                              className="edit-input"
                            />
                          </div>
                        ) : (
                          <div className="course-info">
                            <strong>{course.title}</strong>
                            <small>{course.description?.substring(0, 50)}...</small>
                          </div>
                        )}
                      </td>
                      <td>
                        {editingCourse === course._id ? (
                          <div className="edit-row">
                            <select
                              value={editCourseData.level || ''}
                              onChange={(e) => setEditCourseData({...editCourseData, level: e.target.value})}
                              className="edit-select"
                            >
                              {educationalLevels.map(level => (
                                <option key={level.id} value={level.id}>{level.arabicName}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="level-badge">
                            {educationalLevels.find(level => level.id === course.level)?.arabicName || course.level}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingCourse === course._id ? (
                          <div className="edit-row">
                            <select
                              value={editCourseData.category || ''}
                              onChange={(e) => setEditCourseData({...editCourseData, category: e.target.value})}
                              className="edit-select"
                            >
                              {subcategories
                                .filter(sub => sub.level === editCourseData.level || course.level)
                                .map(sub => (
                                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                                ))
                              }
                            </select>
                          </div>
                        ) : (
                          <span className="course-category">{getCategoryName(course.category?._id || course.category)}</span>
                        )}
                      </td>
                      <td>
                        {editingCourse === course._id ? (
                          <div className="edit-row">
                            <input
                              type="number"
                              value={editCourseData.price || ''}
                              onChange={(e) => setEditCourseData({...editCourseData, price: e.target.value})}
                              className="edit-input"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          `$${course.price}`
                        )}
                      </td>
                      <td>
                        {course.video ? (
                          <a href={course.video} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.8em', wordBreak: 'break-all'}}>
                            {course.video}
                          </a>
                        ) : (
                          <span style={{color: '#aaa', fontSize: '0.8em'}}>No video</span>
                        )}
                      </td>
                      <td>
                        {editingCourse === course._id ? (
                          <div className="edit-actions">
                            <button 
                              className="admin-action-btn save" 
                              onClick={() => handleUpdateCourse(course._id)}
                              title="Save"
                            >
                              <FaSave />
                            </button>
                            <button 
                              className="admin-action-btn cancel" 
                              onClick={handleCancelEditCourse}
                              title="Cancel"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button 
                              className="admin-action-btn edit" 
                              onClick={() => handleEditCourse(course)}
                              title="Edit"
                            >
                              <FaUserEdit />
                            </button>
                            <button 
                              className="admin-action-btn delete" 
                              onClick={() => handleDeleteCourse(course._id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-table">
                      <p>No courses found. Add your first course!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Courses Organized by Level */}
        {courseFilter === 'level' && (
          <div className="courses-by-level">
            {Object.entries(getCoursesByLevel()).map(([level, levelCourses]) => {
              const levelInfo = educationalLevels.find(l => l.id === level);
              const filteredCourses = selectedFilterLevel ? 
                (selectedFilterLevel === level ? levelCourses : []) : 
                levelCourses;
              
              if (filteredCourses.length === 0) return null;

              return (
                <div key={level} className="level-courses-section">
                  <h3 className="level-courses-title">
                    {levelInfo ? levelInfo.arabicName : level} 
                    <span className="course-count-badge">({filteredCourses.length} courses)</span>
                  </h3>
                  <div className="courses-grid">
                    {filteredCourses.map(course => (
                      <div key={course._id} className="course-card">
                        <div className="course-thumbnail">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} />
                          ) : (
                            <div className="course-placeholder">📚</div>
                          )}
                        </div>
                        <div className="course-info">
                          <h4>{course.title}</h4>
                          <p>{course.description?.substring(0, 100)}...</p>
                          <div className="course-meta">
                            <span className="course-price">${course.price}</span>
                            <span className="course-level">
                              {educationalLevels.find(level => level.id === course.level)?.arabicName || course.level}
                            </span>
                          </div>
                        </div>
                        <div className="course-actions">
                          <button 
                            className="admin-action-btn edit" 
                            onClick={() => handleEditCourse(course)}
                            title="Edit"
                          >
                            <FaUserEdit />
                          </button>
                          <button 
                            className="admin-action-btn delete" 
                            onClick={() => handleDeleteCourse(course._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Courses Organized by Category */}
        {courseFilter === 'category' && (
          <div className="courses-by-category">
            {Object.entries(getCoursesByCategory()).map(([categoryId, categoryData]) => {
              const filteredCourses = selectedFilterCategory ? 
                (selectedFilterCategory === categoryId ? categoryData.courses : []) : 
                categoryData.courses;
              
              if (filteredCourses.length === 0) return null;

              return (
                <div key={categoryId} className="category-courses-section">
                  <h3 className="category-courses-title">
                    {categoryData.name}
                    <span className="course-count-badge">({filteredCourses.length} courses)</span>
                  </h3>
                  <div className="courses-grid">
                    {filteredCourses.map(course => (
                      <div key={course._id} className="course-card">
                        <div className="course-thumbnail">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} />
                          ) : (
                            <div className="course-placeholder">📚</div>
                          )}
                        </div>
                        <div className="course-info">
                          <h4>{course.title}</h4>
                          <p>{course.description?.substring(0, 100)}...</p>
                          <div className="course-meta">
                            <span className="course-price">${course.price}</span>
                            <span className="course-level">
                              {educationalLevels.find(level => level.id === course.level)?.arabicName || course.level}
                            </span>
                          </div>
                        </div>
                        <div className="course-actions">
                          <button 
                            className="admin-action-btn edit" 
                            onClick={() => handleEditCourse(course)}
                            title="Edit"
                          >
                            <FaUserEdit />
                          </button>
                          <button 
                            className="admin-action-btn delete" 
                            onClick={() => handleDeleteCourse(course._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Courses Organized by Combined Level and Category */}
        {courseFilter === 'combined' && (
          <div className="courses-combined">
            {Object.entries(getCombinedCourses()).map(([level, levelCategories]) => {
              const levelInfo = educationalLevels.find(l => l.id === level);
              const filteredCategories = selectedFilterLevel ? 
                (selectedFilterLevel === level ? levelCategories : {}) : 
                levelCategories;
              
              if (Object.keys(filteredCategories).length === 0) return null;

              return (
                <div key={level} className="combined-level-section">
                  <h3 className="combined-level-title">
                    {levelInfo ? levelInfo.arabicName : level}
                  </h3>
                  
                  {Object.entries(filteredCategories).map(([categoryId, categoryData]) => {
                    const filteredCourses = selectedFilterCategory ? 
                      (selectedFilterCategory === categoryId ? categoryData.courses : []) : 
                      categoryData.courses;
                    
                    if (filteredCourses.length === 0) return null;

                    return (
                      <div key={categoryId} className="combined-category-section">
                        <h4 className="combined-category-title">
                          {categoryData.name}
                          <span className="course-count-badge">({filteredCourses.length} courses)</span>
                        </h4>
                        <div className="courses-grid">
                          {filteredCourses.map(course => (
                            <div key={course._id} className="course-card">
                              <div className="course-thumbnail">
                                {course.thumbnail ? (
                                  <img src={course.thumbnail} alt={course.title} />
                                ) : (
                                  <div className="course-placeholder">📚</div>
                                )}
                              </div>
                              <div className="course-info">
                                <h4>{course.title}</h4>
                                <p>{course.description?.substring(0, 100)}...</p>
                                <div className="course-meta">
                                  <span className="course-price">${course.price}</span>
                                  <div className="course-badges">
                                    <span className="course-level">
                                      {educationalLevels.find(level => level.id === course.level)?.arabicName || course.level}
                                    </span>
                                    <span className="course-category">{getCategoryName(course.category?._id || course.category)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="course-actions">
                                <button 
                                  className="admin-action-btn edit" 
                                  onClick={() => handleEditCourse(course)}
                                  title="Edit"
                                >
                                  <FaUserEdit />
                                </button>
                                <button 
                                  className="admin-action-btn delete" 
                                  onClick={() => handleDeleteCourse(course._id)}
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Course Form */}
      {showAddCourse && (
        <div className="admin-section">
          <form className="admin-add-course-form" onSubmit={handleAddCourse}>
            <div className="form-header">
              <h3>Add New Course</h3>
              <p>Fill in the essential information for your course</p>
            </div>

            <div className="form-section">
              <h4>Basic Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Title *</label>
                  <input 
                    type="text" 
                    placeholder="Enter course title" 
                    value={newCourse.title} 
                    onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Educational Level *</label>
                  <select 
                    value={newCourse.level || ''} 
                    onChange={e => setNewCourse({ ...newCourse, level: e.target.value, category: '' })}
                    required
                  >
                    <option value="">Select Educational Level</option>
                    {educationalLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.arabicName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject Category *</label>
                  <select 
                    value={newCourse.category} 
                    onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
                    required
                    disabled={!newCourse.level}
                  >
                    <option value="">
                      {newCourse.level ? 'Select Subject' : 'Select Level First'}
                    </option>
                    {subcategories
                      .filter(sub => sub.level === newCourse.level)
                      .map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))
                    }
                  </select>
                </div>
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={newCourse.price} 
                    onChange={e => setNewCourse({ ...newCourse, price: e.target.value })} 
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  placeholder="Describe your course content, what students will learn, etc." 
                  value={newCourse.description} 
                  onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Media Files</h4>
              <div className="cloudinary-limits-warning">
                <span>⚠️</span>
                <div>
                  <strong>Cloudinary Free Plan Limits:</strong>
                  <ul>
                    <li>• Maximum file size: 10MB per file</li>
                    <li>• Storage: 1GB total</li>
                    <li>• Bandwidth: 1GB per month</li>
                    <li>• Transformations: 1,000 per month</li>
                  </ul>
                </div>
              </div>
              <div className="file-size-warning">
                <span>📁</span>
                <span>File size limits: Images (5MB), Videos (100MB) - Videos over 7MB will be auto-compressed</span>
              </div>
              <div className="compression-tools">
                <span>💡</span>
                <span>Need to compress files? Try: <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer">TinyPNG</a> for images, <a href="https://www.youcompress.com" target="_blank" rel="noopener noreferrer">YouCompress</a> for videos</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thumbnail Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                    className="file-input"
                  />
                  <small className="file-hint">Max size: 5MB. Supported: JPEG, PNG, GIF, WebP. 💡 Tip: Use compressed images for faster uploads.</small>
                  {newCourse.thumbnail && (
                    <div className="file-preview">
                      <img 
                        src={URL.createObjectURL(newCourse.thumbnail)} 
                        alt="Thumbnail preview" 
                        className="thumbnail-preview"
                      />
                      <div className="file-info">
                        <span>{newCourse.thumbnail.name}</span>
                        <span>{(newCourse.thumbnail.size / 1024 / 1024).toFixed(2)}MB</span>
                      </div>
                      <div className="file-size-bar">
                        <div 
                          className="file-size-progress" 
                          style={{ 
                            width: `${Math.min((newCourse.thumbnail.size / (5 * 1024 * 1024)) * 100, 100)}%`,
                            backgroundColor: newCourse.thumbnail.size > 4 * 1024 * 1024 ? '#f56565' : '#48bb78'
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Video File</label>
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'video')}
                    className="file-input"
                  />
                  <small className="file-hint">Max size: 100MB. Supported: MP4, AVI, MOV, WMV, FLV, WebM. 💡 Videos over 9MB will be automatically compressed.</small>
                  {newCourse.video && (
                    <div className="file-preview">
                      <VideoPlayer 
                        videoUrl={URL.createObjectURL(newCourse.video)}
                        title="Video Preview"
                      />
                      <div className="file-info">
                        <span>{newCourse.video.name}</span>
                        <span>{(newCourse.video.size / 1024 / 1024).toFixed(2)}MB</span>
                      </div>
                      <div className="file-size-bar">
                        <div 
                          className="file-size-progress" 
                          style={{ 
                            width: `${Math.min((newCourse.video.size / (100 * 1024 * 1024)) * 100, 100)}%`,
                            backgroundColor: newCourse.video.size > 96 * 1024 * 1024 ? '#f56565' : '#48bb78'
                          }}
                        ></div>
                      </div>
                      {(newCourse.video.size / 1024 / 1024) > 9 && (
                        <div className="video-processing-notice">
                          <span>🔄</span>
                          <span>This video will be automatically compressed to fit Cloudinary's limits</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={isAddingCourse}>
                {isAddingCourse ? (
                  <>
                    <div className="spinner"></div>
                    {newCourse.video && (newCourse.video.size / 1024 / 1024) > 9 ? 
                      'Processing Video & Adding Course...' : 
                      'Adding Course...'
                    }
                  </>
                ) : (
                  <>
                    <FaPlus /> Add Course
                  </>
                )}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setShowAddCourse(false)} disabled={isAddingCourse}>
                Cancel
              </button>
            </div>
            
            {/* Upload Progress Bar */}
            {isAddingCourse && (
              <div className="upload-progress-container">
                <div className="upload-progress-bar">
                  <div 
                    className="upload-progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="upload-progress-text">
                  {uploadStatus} {uploadProgress}%
                </div>
              </div>
            )}
            
            {courseError && <div className="admin-error">{courseError}</div>}
          </form>
        </div>
      )}

      {/* Users Management */}
      <div className="admin-section">
        <h2 className="admin-section-title">Users</h2>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Governorate</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user._id}>
                    <td>
                      {editingUser === user._id ? (
                        <input
                          type="text"
                          value={editUserData.name || ''}
                          onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                          className="edit-input"
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <input
                          type="email"
                          value={editUserData.email || ''}
                          onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                          className="edit-input"
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <input
                          type="text"
                          value={editUserData.phone || ''}
                          onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})}
                          className="edit-input"
                        />
                      ) : (
                        user.phone
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <input
                          type="text"
                          value={editUserData.governorate || ''}
                          onChange={(e) => setEditUserData({...editUserData, governorate: e.target.value})}
                          className="edit-input"
                        />
                      ) : (
                        user.governorate
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <select
                          value={editUserData.role || 'user'}
                          onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                          className="edit-select"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {editingUser === user._id ? (
                        <div className="edit-actions">
                          <button 
                            className="admin-action-btn save" 
                            onClick={() => handleUpdateUser(user._id)}
                            title="Save"
                          >
                            <FaSave />
                          </button>
                          <button 
                            className="admin-action-btn cancel" 
                            onClick={handleCancelEditUser}
                            title="Cancel"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button 
                            className="admin-action-btn edit" 
                            onClick={() => handleEditUser(user)}
                            title="Edit"
                          >
                            <FaUserEdit />
                          </button>
                          <button 
                            className="admin-action-btn delete" 
                            onClick={() => handleDeleteUser(user._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table">
                    <p>No users found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courses Modal */}
      {showCoursesModal && selectedSubcategory && (
        <div className="modal-overlay" onClick={closeCoursesModal}>
          <div className="courses-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>كورسات {selectedSubcategory.name}</h3>
              <button className="modal-close" onClick={closeCoursesModal}>×</button>
            </div>
            
            <div className="modal-content">
              {getCoursesForSubcategory(selectedSubcategory).length > 0 ? (
                <div className="courses-grid">
                  {getCoursesForSubcategory(selectedSubcategory).map(course => (
                    <div key={course._id} className="course-card">
                      <div className="course-thumbnail">
                        {course.thumbnail && (
                          <div className="thumbnail-container">
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="course-thumbnail"
                              onClick={() => setVideoPreview(course.video)}
                            />
                            {course.video && (
                              <button 
                                className="play-preview-btn"
                                onClick={() => setVideoPreview(course.video)}
                                title="Play Video"
                              >
                                ▶️
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="course-info">
                        <h4>{course.title}</h4>
                        <p>{course.description?.substring(0, 100)}...</p>
                        <div className="course-meta">
                          <span className="course-price">${course.price}</span>
                          <span className="course-level">
                            {educationalLevels.find(level => level.id === course.level)?.arabicName || course.level}
                          </span>
                        </div>
                      </div>
                      <div className="course-actions">
                        <button className="admin-action-btn edit" title="تعديل">
                          <FaUserEdit />
                        </button>
                        <button 
                          className="admin-action-btn delete" 
                          onClick={() => handleDeleteCourse(course._id)}
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-courses">
                  <p>لا توجد كورسات لهذه المادة بعد</p>
                  <button 
                    className="add-course-btn"
                    onClick={() => {
                      setNewCourse({
                        ...newCourse,
                        level: selectedSubcategory.level,
                        category: selectedSubcategory._id
                      });
                      setShowCoursesModal(false);
                      setShowAddCourse(true);
                    }}
                  >
                    <FaPlus /> إضافة كورس جديد
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {videoPreview && (
        <div className="modal-overlay" onClick={() => setVideoPreview(null)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Video Preview</h3>
              <button className="modal-close" onClick={() => setVideoPreview(null)}>×</button>
            </div>
            <div className="modal-content">
              <VideoPlayer 
                videoUrl={videoPreview}
                title="Video Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 