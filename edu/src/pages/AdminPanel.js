import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import { FaUsers, FaBook, FaLayerGroup, FaDatabase, FaUserEdit, FaTrash, FaPlus, FaEye, FaVideo, FaFile, FaChartLine, FaSave, FaShoppingCart } from 'react-icons/fa';
import { getAllUsers, getCourses, getCategories, deleteUser, updateUser, deleteCourse, updateCourse, addCourse, addCategory, deleteCategory, updateCategory } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import api from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: '', level: '', price: '', thumbnail: null, video: null });
  const [courseError, setCourseError] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [videoFileInfo, setVideoFileInfo] = useState({ name: '', size: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseData, setEditCourseData] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({});
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editSubcategoryData, setEditSubcategoryData] = useState({});
  const [videoPreview, setVideoPreview] = useState(null);
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
  const [purchaseCodes, setPurchaseCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [errorCodes, setErrorCodes] = useState('');
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [selectedCourseForCode, setSelectedCourseForCode] = useState('');
  const [codeCount, setCodeCount] = useState(1);
  const [creatingCode, setCreatingCode] = useState(false);
  const [deletingCodeId, setDeletingCodeId] = useState(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [newPaymentRef, setNewPaymentRef] = useState('');
  const [editingPaymentRef, setEditingPaymentRef] = useState(false);
  const [savingPaymentRef, setSavingPaymentRef] = useState(false);
  const [paymentRefError, setPaymentRefError] = useState('');

  // States for filtering purchase codes view
  const [filterLevel, setFilterLevel] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  // States for 'Create Code' modal
  const [createCodeLevel, setCreateCodeLevel] = useState('');
  const [createCodeCategory, setCreateCodeCategory] = useState('');

  // States for filtering courses view
  const [courseFilterLevel, setCourseFilterLevel] = useState('');
  const [courseFilterCategory, setCourseFilterCategory] = useState('');

  // State for expanded user courses
  const [expandedUserId, setExpandedUserId] = useState(null);

  // State for user search query
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    if (!token || !user || user.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigate('/login');
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, coursesResponse, categoriesData, codesData, paymentData] = await Promise.all([
        getAllUsers().catch(() => ({ users: [] })),
        getCourses().catch(() => ({ products: [] })),
        getCategories().catch(() => []),
        api.get('/purchase-codes').catch(() => ({ data: [] })),
        api.get('/payment-settings').catch(() => ({ data: { paymentRef: '' } }))
      ]);
      setUsers(usersResponse.users || usersResponse || []);
      setCourses(coursesResponse.products || coursesResponse || []);
      setCategories(categoriesData);
      setSubcategories(categoriesData);
      setPurchaseCodes(codesData.data);
      setPaymentRef(paymentData.data.paymentRef);
      setNewPaymentRef(paymentData.data.paymentRef);
    } catch (err) {
      setError('Failed to load some admin data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const refreshData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure?')) { try { await deleteUser(userId); await refreshData(); } catch (e) { alert('Failed to delete user.') } }
  };
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure?')) { try { await deleteCourse(courseId); await refreshData(); } catch (e) { alert('Failed to delete course.') } }
  };
  const handleDeleteCategory = async (catId) => {
    if (window.confirm('Are you sure?')) { try { await deleteCategory(catId); await refreshData(); } catch (e) { alert('Failed to delete category.') } }
  };
  const handleEditCourse = (course) => { setEditingCourse(course._id); setEditCourseData({ ...course, category: course.category?._id || course.category }); };
  const handleUpdateCourse = async (id) => { try { await updateCourse(id, editCourseData); setEditingCourse(null); await refreshData(); } catch (e) { alert('Failed to update course.') } };
  const handleCancelEditCourse = () => setEditingCourse(null);
  const handleEditUser = (user) => { setEditingUser(user._id); setEditUserData(user); };
  const handleUpdateUser = async (id) => { try { await updateUser(id, editUserData); setEditingUser(null); await refreshData(); } catch (e) { alert('Failed to update user.') } };
  const handleCancelEditUser = () => setEditingUser(null);
  const handleEditSubcategory = (cat) => { setEditingSubcategory(cat._id); setEditSubcategoryData(cat); };
  const handleUpdateSubcategory = async (id) => { try { await updateCategory(id, editSubcategoryData); setEditingSubcategory(null); await refreshData(); } catch (e) { alert('Failed to update subcategory.') } };
  const handleCancelEditSubcategory = () => setEditingSubcategory(null);
  const handleFileChange = (e, type) => {
      const file = e.target.files[0];
      if (!file) {
        if (type === 'video') {
            setVideoFileInfo({ name: '', size: '' });
        }
        setNewCourse(prev => ({ ...prev, [type]: null }));
        return;
      }
      setNewCourse(prev => ({ ...prev, [type]: file }));

      if (type === 'video') {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setVideoFileInfo({ name: file.name, size: `${sizeInMB} MB` });
      }
  };
  const handleAddCourse = async (e) => {
    e.preventDefault();
    setIsAddingCourse(true);
    const formData = new FormData();
    Object.keys(newCourse).forEach(key => newCourse[key] && formData.append(key, newCourse[key]));
    try {
        await addCourse(formData, setUploadProgress);
        setShowAddCourse(false);
        setNewCourse({ title: '', description: '', category: '', level: '', price: '', thumbnail: null, video: null });
        await refreshData();
        alert('Course added!');
    } catch (err) {
        setCourseError(err.response?.data?.message || 'Failed to add course.');
    } finally {
        setIsAddingCourse(false);
    }
  };
  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newSubcategory.name);
    formData.append('description', newSubcategory.description);
    formData.append('level', selectedLevel);
    if (newSubcategory.image) formData.append('image', newSubcategory.image);
    try {
        await addCategory(formData);
        setShowAddSubcategory(false);
        setNewSubcategory({ name: '', description: '', image: null });
        await refreshData();
    } catch (err) {
        setSubcategoryError('Failed to add subcategory.');
    }
  };
  const handleCreateCode = async (e) => {
    e.preventDefault();
    setCreatingCode(true);
    try {
        const res = await api.post('/purchase-codes/create', { courseId: selectedCourseForCode, count: codeCount });
        setShowAddCodeModal(false);
        await refreshData();
        alert(res.data.message);
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to create codes.');
    } finally {
        setCreatingCode(false);
    }
  };
  const handleDeleteCode = async (id) => {
    if (window.confirm('Are you sure?')) {
        setDeletingCodeId(id);
        try { await api.delete(`/purchase-codes/${id}`); await refreshData(); }
        catch (e) { alert(e.response?.data?.message || 'Failed to delete code.') }
        finally { setDeletingCodeId(null); }
    }
  };
  const handleSavePaymentRef = async (e) => {
    e.preventDefault();
    setSavingPaymentRef(true);
    try {
        await api.post('/payment-settings', { paymentRef: newPaymentRef });
        setEditingPaymentRef(false);
        await refreshData();
        alert('Payment reference updated!');
    } catch (err) {
        setPaymentRefError(err.response?.data?.message || 'Failed to save.');
    } finally {
        setSavingPaymentRef(false);
    }
  };
  const getCategoryName = (id) => categories.find(c => c._id === id)?.name || 'Unknown';

  const filteredCodes = React.useMemo(() => {
    let codesToDisplay = purchaseCodes;

    if (filterCourse) {
      return codesToDisplay.filter(code => code.course?._id === filterCourse);
    }
    if (filterCategory) {
      const courseIdsInCategory = courses
        .filter(c => (c.category?._id || c.category) === filterCategory)
        .map(c => c._id);
      return codesToDisplay.filter(code => courseIdsInCategory.includes(code.course?._id));
    }
    if (filterLevel) {
      const courseIdsInLevel = courses
        .filter(c => c.level === filterLevel)
        .map(c => c._id);
      return codesToDisplay.filter(code => courseIdsInLevel.includes(code.course?._id));
    }

    return codesToDisplay;
  }, [filterLevel, filterCategory, filterCourse, purchaseCodes, courses]);

  const filteredCourses = React.useMemo(() => {
    let coursesToDisplay = courses;
    if (courseFilterCategory) {
      coursesToDisplay = coursesToDisplay.filter(c => (c.category?._id || c.category) === courseFilterCategory);
    } else if (courseFilterLevel) {
      coursesToDisplay = coursesToDisplay.filter(c => c.level === courseFilterLevel);
    }
    return coursesToDisplay;
  }, [courseFilterLevel, courseFilterCategory, courses]);

  const subscriberCountByCourse = React.useMemo(() => {
    const counts = {};
    purchaseCodes.forEach(code => {
        if (code.used && code.course?._id) {
            const courseId = code.course._id;
            counts[courseId] = (counts[courseId] || 0) + 1;
        }
    });
    return counts;
  }, [purchaseCodes]);

  const searchedUsers = React.useMemo(() => {
    const query = userSearchQuery.toLowerCase().trim();
    if (!query) {
      return users.filter(u => u.role === 'user');
    }
    return users.filter(u =>
      u.role === 'user' &&
      (u.name.toLowerCase().includes(query) || u.phone?.includes(query))
    );
  }, [users, userSearchQuery]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        const totalUsers = users.filter(u => u.role === 'user').length;
        const totalCourses = courses.length;
        const totalPurchases = purchaseCodes.filter(c => c.used).length;
        const totalRevenue = purchaseCodes
          .filter(c => c.used && c.course)
          .reduce((sum, code) => sum + (code.course.price || 0), 0);

        return (
        <div className="admin-stats-grid">
            <div className="admin-stat-card"><div className="stat-icon users"><FaUsers /></div><div className="stat-content"><h3>{totalUsers}</h3><p>Total Users</p></div></div>
            <div className="admin-stat-card"><div className="stat-icon courses"><FaBook /></div><div className="stat-content"><h3>{totalCourses}</h3><p>Total Courses</p></div></div>
            <div className="admin-stat-card"><div className="stat-icon views"><FaShoppingCart /></div><div className="stat-content"><h3>{totalPurchases}</h3><p>Total Purchases</p></div></div>
            <div className="admin-stat-card"><div className="stat-icon revenue"><FaChartLine /></div><div className="stat-content"><h3>${totalRevenue.toFixed(2)}</h3><p>Total Revenue</p></div></div>
        </div>
      );
      case 'courses': return (
        <>
        <div className="admin-section-header"><h2>Courses Management</h2><button className="admin-action-btn add" onClick={() => setShowAddCourse(!showAddCourse)}><FaPlus /> Add Course</button></div>
        
        <div className="filters-container" style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
          <select value={courseFilterLevel} onChange={e => { setCourseFilterLevel(e.target.value); setCourseFilterCategory(''); }}>
            <option value="">All Levels</option>
            {educationalLevels.map(l => <option key={l.id} value={l.id}>{l.arabicName}</option>)}
          </select>
          <select value={courseFilterCategory} onChange={e => setCourseFilterCategory(e.target.value)} disabled={!courseFilterLevel}>
            <option value="">All Categories</option>
            {categories.filter(c => c.level === courseFilterLevel).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        
        {showAddCourse && (
            <div className="admin-add-form-container">
              <form onSubmit={handleAddCourse} className="admin-add-form">
                  <h3><FaPlus /> Add New Course</h3>
                  <div className="form-grid">
                      <div className="form-group full-width">
                          <label>Course Title</label>
                          <input type="text" placeholder="e.g., Advanced Mathematics" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
                      </div>
                      <div className="form-group">
                          <label>Educational Level</label>
                          <select value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value})} required><option value="">Select Level</option>{educationalLevels.map(l=><option key={l.id} value={l.id}>{l.arabicName}</option>)}</select>
                      </div>
                      <div className="form-group">
                          <label>Category</label>
                          <select value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})} required disabled={!newCourse.level}><option value="">Select Category</option>{categories.filter(c=>c.level === newCourse.level).map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select>
                      </div>
                      <div className="form-group">
                          <label>Price ($)</label>
                          <input type="number" placeholder="e.g., 50" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} required />
                      </div>
                      <div className="form-group full-width">
                          <label>Description</label>
                          <textarea placeholder="A brief description of the course content." value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})}></textarea>
                      </div>
                      <div className="form-group">
                          <label>Thumbnail Image</label>
                          <input type="file" onChange={e => handleFileChange(e, 'thumbnail')} accept="image/*" />
                      </div>
                      <div className="form-group">
                          <label>Introductory Video</label>
                          <input type="file" onChange={e => handleFileChange(e, 'video')} accept="video/*" />
                          {newCourse.video && (
                            <div className="file-info">
                                <span>{videoFileInfo.name}</span>
                                <span>{videoFileInfo.size}</span>
                            </div>
                          )}
                      </div>
                  </div>
                  {isAddingCourse && uploadProgress > 0 && (
                    <div className="upload-progress-container">
                        <p>Uploading video... {Math.round(uploadProgress)}%</p>
                        <div className="upload-progress-bar">
                            <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    </div>
                  )}
                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isAddingCourse}>{isAddingCourse ? 'Adding...' : 'Add Course'}</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowAddCourse(false)}>Cancel</button>
                  </div>
              </form>
            </div>
        )}
        <div className="admin-table-wrapper">
          <table className="admin-table">
              <thead><tr><th>Title</th><th>Level</th><th>Category</th><th>Price</th><th>Subscribers</th><th>Actions</th></tr></thead>
              <tbody>
              {filteredCourses.map(course => (
                  <tr key={course._id}>
                  <td>{editingCourse === course._id ? <input value={editCourseData.title} onChange={e => setEditCourseData({...editCourseData, title: e.target.value})} /> : course.title}</td>
                  <td>{editingCourse === course._id ? <select value={editCourseData.level} onChange={e => setEditCourseData({...editCourseData, level: e.target.value})}>{educationalLevels.map(l=><option key={l.id} value={l.id}>{l.arabicName}</option>)}</select> : educationalLevels.find(l=>l.id===course.level)?.arabicName}</td>
                  <td>{editingCourse === course._id ? <select value={editCourseData.category} onChange={e => setEditCourseData({...editCourseData, category: e.target.value})}>{categories.filter(c=>c.level === course.level).map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select> : getCategoryName(course.category?._id || course.category)}</td>
                  <td>{editingCourse === course._id ? <input type="number" value={editCourseData.price} onChange={e => setEditCourseData({...editCourseData, price: e.target.value})} /> : `$${course.price}`}</td>
                  <td>{subscriberCountByCourse[course._id] || 0}</td>
                  <td>
                      <div className="action-buttons">
                      {editingCourse === course._id ? (<><button className="save" onClick={() => handleUpdateCourse(course._id)}><FaSave/></button><button className="cancel" onClick={handleCancelEditCourse}>X</button></>) : (<><button className="edit" onClick={() => handleEditCourse(course)}><FaUserEdit/></button><button className="delete" onClick={() => handleDeleteCourse(course._id)}><FaTrash/></button></>)}
                      </div>
                  </td>
                  </tr>
              ))}
              </tbody>
          </table>
        </div>
        </>
      );
      case 'users': return (
        <>
          <div className="filters-container" style={{ margin: '1rem 0' }}>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
              style={{ padding: '0.5rem', width: '300px', fontSize: '1rem' }}
            />
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Last Seen</th><th>Actions</th></tr></thead>
              <tbody>
                {searchedUsers.map(user => (
                  <React.Fragment key={user._id}>
                    <tr>
                      <td>{editingUser === user._id ? <input value={editUserData.name} onChange={e=>setEditUserData({...editUserData, name: e.target.value})} /> : user.name}</td>
                      <td>{editingUser === user._id ? <input value={editUserData.email} onChange={e=>setEditUserData({...editUserData, email: e.target.value})} /> : user.email}</td>
                      <td>{editingUser === user._id ? <input value={editUserData.phone} onChange={e=>setEditUserData({...editUserData, phone: e.target.value})} /> : user.phone}</td>
                      <td>{editingUser === user._id ? <select value={editUserData.role} onChange={e=>setEditUserData({...editUserData, role: e.target.value})}><option value="user">User</option><option value="admin">Admin</option></select> : user.role}</td>
                      <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <div className="action-buttons">
                          {editingUser === user._id ? (
                            <>
                              <button className="save" onClick={() => handleUpdateUser(user._id)}><FaSave/></button>
                              <button className="cancel" onClick={handleCancelEditUser}>X</button>
                            </>
                          ) : (
                            <>
                              <button className="edit" onClick={() => handleEditUser(user)}><FaUserEdit/></button>
                              <button className="delete" onClick={() => handleDeleteUser(user._id)}><FaTrash/></button>
                              {user.purchasedCourses && user.purchasedCourses.length > 0 && (
                                <button className="expand-btn" onClick={() => setExpandedUserId(expandedUserId === user._id ? null : user._id)}>
                                  {expandedUserId === user._id ? '▲' : '▼'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedUserId === user._id && (
                      <tr className="expanded-row">
                        <td colSpan="6">
                          <div className="expanded-content">
                            <h4>Purchased Courses:</h4>
                            <ul>
                              {user.purchasedCourses.map(course => (
                                <li key={course._id}>{course.title}</li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
      case 'categories': return (
        <>
            <div className="admin-section-header"><h2>Categories Management</h2><button className="admin-action-btn add" onClick={() => setShowAddSubcategory(!showAddSubcategory)}><FaPlus /> Add Category</button></div>
            {showAddSubcategory && (
              <div className="admin-add-form-container">
                <form onSubmit={handleAddSubcategory} className="admin-add-form">
                    <h3><FaPlus /> Add New Category</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Educational Level</label>
                        <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} required><option value="">Select Level</option>{educationalLevels.map(l=><option key={l.id} value={l.id}>{l.arabicName}</option>)}</select>
                      </div>
                      <div className="form-group">
                        <label>Category Name</label>
                        <input type="text" placeholder="e.g., Algebra" value={newSubcategory.name} onChange={e => setNewSubcategory({...newSubcategory, name: e.target.value})} required />
                      </div>
                      <div className="form-group full-width">
                        <label>Description</label>
                        <textarea placeholder="A brief description for the category." value={newSubcategory.description} onChange={e => setNewSubcategory({...newSubcategory, description: e.target.value})}></textarea>
                      </div>
                      <div className="form-group full-width">
                        <label>Category Image</label>
                        <input type="file" onChange={e => setNewSubcategory({...newSubcategory, image: e.target.files[0]})} accept="image/*" />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Add Category</button>
                      <button type="button" className="cancel-btn" onClick={() => setShowAddSubcategory(false)}>Cancel</button>
                    </div>
                </form>
              </div>
            )}
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead><tr><th>Name</th><th>Level</th><th>Actions</th></tr></thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat._id}>
                                <td>{editingSubcategory === cat._id ? <input value={editSubcategoryData.name} onChange={e=>setEditSubcategoryData({...editSubcategoryData, name: e.target.value})} /> : cat.name}</td>
                                <td>{editingSubcategory === cat._id ? <select value={editSubcategoryData.level} onChange={e => setEditSubcategoryData({...editSubcategoryData, level: e.target.value})}>{educationalLevels.map(l=><option key={l.id} value={l.id}>{l.arabicName}</option>)}</select> : educationalLevels.find(l=>l.id===cat.level)?.arabicName}</td>
                                <td>
                                    <div className="action-buttons">
                                    {editingSubcategory === cat._id ? (<><button className="save" onClick={() => handleUpdateSubcategory(cat._id)}><FaSave/></button><button className="cancel" onClick={handleCancelEditSubcategory}>X</button></>) : (<><button className="edit" onClick={() => handleEditSubcategory(cat)}><FaUserEdit/></button><button className="delete" onClick={() => handleDeleteCategory(cat._id)}><FaTrash/></button></>)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
      );
      case 'financial':
        const totalFilteredCodes = filteredCodes.length;
        const usedFilteredCodes = filteredCodes.filter(c => c.used).length;
        return (
        <>
            <div className="admin-section">
                <div className="admin-section-header">
                  <h2>
                    Purchase Codes
                    <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '1rem', color: '#666' }}>
                      (Used: {usedFilteredCodes} / Total: {totalFilteredCodes})
                    </span>
                  </h2>
                  <button className="admin-action-btn add" onClick={() => setShowAddCodeModal(true)}><FaPlus /> Create Codes</button>
                </div>
                
                <div className="filters-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setFilterCategory(''); setFilterCourse(''); }}>
                    <option value="">All Levels</option>
                    {educationalLevels.map(l => <option key={l.id} value={l.id}>{l.arabicName}</option>)}
                  </select>
                  <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setFilterCourse(''); }} disabled={!filterLevel}>
                    <option value="">All Categories</option>
                    {categories.filter(c => c.level === filterLevel).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} disabled={!filterCategory}>
                    <option value="">All Courses</option>
                    {courses.filter(c => (c.category?._id || c.category) === filterCategory).map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>

                <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead><tr><th>Code</th><th>Course</th><th>Used</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filteredCodes.map(code => (
                            <tr key={code._id}>
                                <td>{code.code}</td>
                                <td>{code.course?.title || 'N/A'}</td>
                                <td>{code.used ? `Yes (${code.usedBy?.name || 'N/A'})` : 'No'}</td>
                                <td><div className="action-buttons"><button className="delete" onClick={() => handleDeleteCode(code._id)} disabled={deletingCodeId === code._id}><FaTrash/></button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
            <div className="admin-section">
                <h2>Payment Reference</h2>
                {editingPaymentRef ? (
                    <form onSubmit={handleSavePaymentRef} className="payment-ref-form">
                        <input value={newPaymentRef} onChange={e => setNewPaymentRef(e.target.value)} />
                        <button type="submit" disabled={savingPaymentRef}><FaSave/></button>
                        <button type="button" onClick={() => setEditingPaymentRef(false)}>X</button>
                    </form>
                ) : (
                    <div className="payment-ref-view">
                        <p>{paymentRef || 'Not Set'}</p>
                        <button onClick={() => setEditingPaymentRef(true)}><FaUserEdit/></button>
                    </div>
                )}
            </div>
        </>
      );
      default: return null;
    }
  };

  if (loading) return <div className="admin-loading"><div className="loading-spinner"></div></div>;
  if (error) return <div className="admin-error-container"><h2>Error</h2><p>{error}</p><button onClick={fetchData}>Retry</button></div>;

  return (
    <div className="admin-panel">
      <div className="admin-header"><h1>Admin Dashboard</h1></div>
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><FaChartLine /> Dashboard</button>
        <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}><FaBook /> Courses</button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><FaUsers /> Users</button>
        <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}><FaLayerGroup /> Categories</button>
        <button className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`} onClick={() => setActiveTab('financial')}><FaDatabase /> Financial</button>
      </div>
      <div className="tab-content">
        {renderContent()}
      </div>

      {showAddCodeModal && (
        <div className="modal-overlay" onClick={() => setShowAddCodeModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateCode}>
              <h3>Create Codes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select value={createCodeLevel} onChange={e => { setCreateCodeLevel(e.target.value); setCreateCodeCategory(''); setSelectedCourseForCode(''); }} required>
                  <option value="">Select Level</option>
                  {educationalLevels.map(l => <option key={l.id} value={l.id}>{l.arabicName}</option>)}
                </select>
                <select value={createCodeCategory} onChange={e => { setCreateCodeCategory(e.target.value); setSelectedCourseForCode(''); }} disabled={!createCodeLevel} required>
                  <option value="">Select Category</option>
                  {categories.filter(c => c.level === createCodeLevel).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select value={selectedCourseForCode} onChange={e => setSelectedCourseForCode(e.target.value)} disabled={!createCodeCategory} required>
                  <option value="">Select Course</option>
                  {courses.filter(c => (c.category?._id || c.category) === createCodeCategory).map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
                <input type="number" value={codeCount} onChange={e => setCodeCount(e.target.value)} min="1" required placeholder="Number of codes" />
                <button type="submit" disabled={creatingCode} className="submit-btn">{creatingCode ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;