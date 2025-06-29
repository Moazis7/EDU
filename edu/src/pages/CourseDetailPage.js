import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourseById } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import LessonList from '../components/LessonList';
import { FaArrowLeft, FaDownload, FaBook, FaClock, FaUser, FaStar } from 'react-icons/fa';
import './CourseDetailPage.css';

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

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  }

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