import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourseById } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import LessonList from '../components/LessonList';
import { FaArrowLeft, FaDownload, FaBook, FaClock, FaUser, FaStar } from 'react-icons/fa';
import './CourseDetailPage.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const requiredLevel = query.get('level');
  const requiredCategory = query.get('category');
  const requiredSubCategory = query.get('subCategory');
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isAuthenticated, updateUser, loading: authLoading } = useAuth();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [purchaseCode, setPurchaseCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [accessAllowed, setAccessAllowed] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const courseData = await getCourseById(id);
        setCourse(courseData);
        if (courseData.lessons && courseData.lessons.length > 0) {
            // Automatically select the first lesson to play
            setSelectedLesson(courseData.lessons[0]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load course details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (course && course.lessons && course.lessons.length > 0) {
      // ابحث عن أول درس يطابق الفلاتر
      const filteredLesson = course.lessons.find(
        lesson =>
          (!requiredLevel || lesson.level === requiredLevel) &&
          (!requiredCategory || lesson.category === requiredCategory) &&
          (!requiredSubCategory || lesson.subCategory === requiredSubCategory)
      );
      setSelectedLesson(filteredLesson || course.lessons[0]);
    }
  }, [course, requiredLevel, requiredCategory, requiredSubCategory]);

  // Fetch paymentRef on mount
  useEffect(() => {
    const fetchPaymentRef = async () => {
      try {
        const res = await api.get('/payment-settings');
        setPaymentRef(res.data.paymentRef || '');
      } catch (err) {
        setPaymentRef('');
      }
    };
    fetchPaymentRef();
  }, []);

  // Check if user has purchased the course
  useEffect(() => {
    if (!isAuthenticated || !user || !course) return;
    if (user.purchasedCourses && user.purchasedCourses.includes(course._id)) {
      setAccessAllowed(true);
      setShowPurchaseModal(false);
    } else {
      setAccessAllowed(false);
      setShowPurchaseModal(true);
    }
  }, [user, course, isAuthenticated]);

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setPurchaseError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/purchase-codes/verify', { code: purchaseCode, courseId: course._id }, {
        headers: { 'y-auth-token': token }
      });
      // Update user context (add course to purchasedCourses)
      const updatedUser = { ...user, purchasedCourses: [...(user.purchasedCourses || []), course._id] };
      updateUser(updatedUser);
      setAccessAllowed(true);
      setShowPurchaseModal(false);
      setPurchaseCode('');
      alert('تم تفعيل الكورس بنجاح! يمكنك الآن مشاهدة المحتوى.');
    } catch (err) {
      setPurchaseError(err.response?.data?.message || 'فشل التحقق من الكود. حاول مرة أخرى.');
    } finally {
      setVerifying(false);
    }
  };

  if (authLoading) return <div>Loading...</div>;

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-error">
        <h2>Course Not Found</h2>
        <p>{error || 'The course you are looking for does not exist.'}</p>
        <button onClick={() => navigate('/courses')} className="back-btn">
          <FaArrowLeft /> Back to Courses
        </button>
      </div>
    );
  }

  // تحقق من التطابق مع الفلترة المطلوبة
  if (
    (requiredLevel && course.level !== requiredLevel) ||
    (requiredCategory && ((course.category?._id || course.category) !== requiredCategory))
  ) {
    return (
      <div className="course-detail-error">
        <h2>الكورس غير متاح</h2>
        <p>هذا الكورس غير متاح لهذا المستوى أو القسم.</p>
        <button onClick={() => navigate('/courses')} className="back-btn">
          <FaArrowLeft /> عودة للكورسات
        </button>
      </div>
    );
  }

  const { title, description, thumbnail, createdBy, price, lessons } = course;
  const authorName = createdBy ? createdBy.name : 'Unknown Author';
  const courseThumbnailUrl = thumbnail 
    ? `http://localhost:3009${thumbnail}` 
    : 'https://via.placeholder.com/1200x600.png?text=EduPlatform';

  const selectedVideoUrl = selectedLesson?.video 
    ? selectedLesson.video 
    : course.video 
      ? course.video 
      : null;

  console.log('🔗 Video URL:', course.video);

  if (!accessAllowed) {
    return (
      <div className="course-detail-locked">
        {showPurchaseModal && (
          <div className="modal-overlay" style={{zIndex:1000,background:'rgba(30,41,59,0.7)'}}>
            <div className="purchase-modal-card" style={{maxWidth:'420px',margin:'5vh auto',borderRadius:'18px',boxShadow:'0 8px 32px rgba(0,0,0,0.18)',background:'#fff',padding:'2.2rem 2rem 2rem 2rem',position:'relative',display:'flex',flexDirection:'column',alignItems:'center'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'1.2rem'}}>
                <div style={{background:'#4299e1',color:'#fff',borderRadius:'50%',width:'60px',height:'60px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',boxShadow:'0 2px 8px rgba(66,153,225,0.12)'}}>
                  <span role="img" aria-label="pay">💳</span>
                </div>
                <h3 style={{margin:'1rem 0 0.5rem 0',fontWeight:700,fontSize:'1.3rem',color:'#234e52'}}>شراء الكورس</h3>
                <span style={{color:'#718096',fontSize:'1rem'}}>خطوات تفعيل الكورس بعد الدفع</span>
              </div>
              <div style={{width:'100%',marginBottom:'1.5rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.7rem',marginBottom:'1.1rem'}}>
                  <span style={{fontSize:'1.3rem',color:'#4299e1'}}>1</span>
                  <span style={{fontWeight:600,color:'#234e52'}}>حوّل المبلغ على رقم الدفع:</span>
                </div>
                <div style={{fontWeight:'bold',fontSize:'1.2rem',background:'#f7fafc',padding:'0.7rem 1.2rem',borderRadius:'8px',margin:'0.2rem 0 0.7rem 0',letterSpacing:'1px',display:'inline-block',color:'#2b6cb0',border:'1px solid #e2e8f0',textAlign:'center'}}>{paymentRef || '—'}</div>
                <div style={{display:'flex',alignItems:'center',gap:'0.7rem',marginBottom:'1.1rem'}}>
                  <span style={{fontSize:'1.3rem',color:'#4299e1'}}>2</span>
                  <span style={{fontWeight:600,color:'#234e52'}}>احتفظ بإيصال التحويل أو رقم العملية.</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'0.7rem',marginBottom:'1.1rem'}}>
                  <span style={{fontSize:'1.3rem',color:'#4299e1'}}>3</span>
                  <span style={{fontWeight:600,color:'#234e52'}}>تواصل مع الإدارة للحصول على كود الشراء.</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'0.7rem',marginBottom:'0.7rem'}}>
                  <span style={{fontSize:'1.3rem',color:'#4299e1'}}>4</span>
                  <span style={{fontWeight:600,color:'#234e52'}}>أدخل كود الشراء هنا لتفعيل الكورس:</span>
                </div>
              </div>
              <form onSubmit={handleVerifyCode} style={{width:'100%',marginTop:'0.5rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{width:'100%',marginBottom:'0.7rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <span style={{fontSize:'1.3rem',color:'#4299e1'}}><i className="fa fa-key" /></span>
                  <input type="text" value={purchaseCode} onChange={e=>setPurchaseCode(e.target.value)} required placeholder="كود الشراء" style={{flex:1,padding:'0.7rem',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'1.1rem',letterSpacing:'1px',background:'#f9fafb'}} />
                </div>
                <button type="submit" className="enroll-btn" disabled={verifying} style={{width:'100%',padding:'0.7rem',fontSize:'1.1rem',borderRadius:'8px',background:'#4299e1',color:'#fff',fontWeight:600,boxShadow:'0 2px 8px rgba(66,153,225,0.08)',marginBottom:'0.5rem'}}>{verifying ? 'جاري التحقق...' : 'تفعيل الكورس'}</button>
                {purchaseError && <div style={{color:'#e53e3e',marginTop:'0.7rem',fontWeight:600,background:'#fff5f5',padding:'0.5rem',borderRadius:'8px',border:'1px solid #feb2b2',width:'100%',textAlign:'center'}}>{purchaseError}</div>}
              </form>
              <div style={{marginTop:'1.7rem',textAlign:'center',color:'#718096',fontSize:'0.97rem'}}>
                <span style={{fontSize:'1.1rem'}}>💡</span> إذا واجهت أي مشكلة في الدفع أو التفعيل، تواصل مع الدعم.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      className="course-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="course-header">
        <button onClick={() => navigate('/courses')} className="back-btn">
          <FaArrowLeft /> Back to Courses
        </button>
        <div className="course-breadcrumb">
          <span>Courses</span>
          <span>›</span>
          <span>{course.title}</span>
        </div>
      </div>

      <div className="course-detail-container">
        {/* Main Content */}
        <div className="course-main">
          {/* Video Player */}
          <div className="course-video-section">
            <VideoPlayer 
              videoUrl={course.video}
              poster={course.thumbnail}
              title={course.title}
            />
          </div>

          {/* Course Info */}
          <div className="course-info-section">
            <h1 className="course-title">{title}</h1>
            <p className="course-author-detail">Created by <span>{authorName}</span></p>
            <div className="course-description">
                <h2>About This Course</h2>
                <p>{description}</p>
            </div>
            
            <div className="course-meta">
              <div className="meta-item">
                <FaUser />
                <span>Instructor: Admin</span>
              </div>
              <div className="meta-item">
                <FaClock />
                <span>Duration: 2 hours</span>
              </div>
              <div className="meta-item">
                <FaBook />
                <span>Level: {course.level}</span>
              </div>
              <div className="meta-item">
                <FaStar />
                <span>Rating: 4.5/5</span>
              </div>
            </div>

            <div className="course-price-section">
              <div className="price-info">
                <span className="price">${price}</span>
                <span className="price-label">One-time payment</span>
              </div>
              <button className="enroll-btn">
                Enroll Now
              </button>
            </div>
          </div>

          {/* Course Tabs */}
          <div className="course-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
              onClick={() => setActiveTab('curriculum')}
            >
              Curriculum
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <h3>What you'll learn</h3>
                <ul className="learning-points">
                  <li>Master the fundamentals of the subject</li>
                  <li>Apply practical knowledge in real-world scenarios</li>
                  <li>Build confidence through hands-on exercises</li>
                  <li>Develop problem-solving skills</li>
                </ul>

                <h3>Requirements</h3>
                <ul className="requirements">
                  <li>Basic computer skills</li>
                  <li>No prior experience needed</li>
                  <li>Willingness to learn</li>
                </ul>

                <h3>Description</h3>
                <p>{description}</p>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="curriculum-content">
                <h3>Course Content</h3>
                <div className="curriculum-item">
                  <div className="curriculum-header">
                    <span className="lesson-title">Introduction to {title}</span>
                    <span className="lesson-duration">15 min</span>
                  </div>
                  <p className="lesson-description">Overview of the course and what you'll learn</p>
                </div>
                
                {course.files && course.files.length > 0 && (
                  <div className="course-files">
                    <h4>Course Materials</h4>
                    {course.files.map((file, index) => (
                      <div key={index} className="file-item">
                        <FaDownload />
                        <span>{file.filename}</span>
                        <button className="download-btn">Download</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <h3>Student Reviews</h3>
                <div className="reviews-summary">
                  <div className="rating-overview">
                    <div className="average-rating">4.5</div>
                    <div className="stars">★★★★☆</div>
                    <div className="total-reviews">Based on 127 reviews</div>
                  </div>
                </div>
                
                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">Ahmed Mohamed</span>
                      <div className="review-stars">★★★★★</div>
                    </div>
                    <span className="review-date">2 days ago</span>
                  </div>
                  <p className="review-text">
                    Excellent course! The instructor explains everything clearly and the content is very practical.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="course-sidebar">
          <div className="sidebar-card">
            <h3>Course Features</h3>
            <ul className="features-list">
              <li>✓ Full lifetime access</li>
              <li>✓ Access on mobile and TV</li>
              <li>✓ Certificate of completion</li>
              <li>✓ 30-day money-back guarantee</li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h3>Share this course</h3>
            <div className="share-buttons">
              <button className="share-btn facebook">Facebook</button>
              <button className="share-btn twitter">Twitter</button>
              <button className="share-btn linkedin">LinkedIn</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetailPage; 