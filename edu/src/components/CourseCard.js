import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaStar, FaBookOpen } from 'react-icons/fa';
import './CourseCard.css';
import { useAuth } from '../context/AuthContext';

const CourseCard = ({ course, isMyCourseCard = false }) => {
  const { user } = useAuth();
  if (!course) {
    return null;
  }

  const purchased = user && user.purchasedCourses && user.purchasedCourses.includes(course._id);

  // بيانات احتياطية
  const teacherName = course.teacher?.name || 'غير محدد';
  const teacherAvatar = course.teacher?.avatar || '/default-teacher.png';
  const lessonsCount = course.lessonsCount ?? course.lessons?.length ?? 0;
  const rating = course.rating ?? 4.8;
  const category = course.category?.name || 'تصنيف';
  const price = course.price > 0 ? `${course.price} ج.م` : 'مجاني';

  return (
    <div className="modern-course-card square-card">
      <div className="modern-card-image-wrapper">
        {(isMyCourseCard || purchased) && (
          <div className="mycourse-badge">تم الشراء</div>
        )}
        <img 
          src={course.thumbnail || '/default-course-thumbnail.jpg'} 
          alt={course.title} 
          className="modern-card-image"
        />
      </div>
      <div className="modern-card-content">
        <h2 className="course-card-title">{course.title}</h2>
        <div className="card-title-divider"></div>
        {course.description && (
          <div className="course-card-description">
            <FaBookOpen className="desc-icon" />
            <span>{course.description}</span>
          </div>
        )}
        <div className="course-card-category-badge">{course.category?.name || 'بدون تصنيف'}</div>
        <div className="modern-card-teacher">
          <span>{teacherName}</span>
        </div>
        <div className="modern-card-meta">
          <span title="عدد الدروس"><FaBookOpen /> {lessonsCount}</span>
          <span title="التقييم"><FaStar className="star" /> {rating}</span>
        </div>
        <span className="course-card-price">{course.price === 0 ? 'مجاني' : `${course.price} جنيه`}</span>
        <Link to={`/course/${course._id}`} className="buy-course-btn purple-gradient-btn">
          {(isMyCourseCard || purchased) ? 'ابدأ الكورس' : 'اشتري الدرس'}
        </Link>
      </div>
    </div>
  );
};

export default CourseCard; 