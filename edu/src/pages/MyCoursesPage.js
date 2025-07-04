import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CourseCard from '../components/CourseCard';

const MyCoursesPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user || !user.purchasedCourses || user.purchasedCourses.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // جلب بيانات الكورسات المشتراة
        const res = await api.post('/upload/by-ids', { ids: user.purchasedCourses });
        setCourses(res.data.courses || []);
        setError(null);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل الكورسات.');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && user) fetchCourses();
  }, [user, isAuthenticated]);

  if (authLoading || loading) return <div className="loading-message">جاري التحميل...</div>;
  if (!isAuthenticated) return <div className="error-message">يجب تسجيل الدخول أولاً.</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-courses-page">
      <h2>كورساتي</h2>
      {courses.length === 0 ? (
        <div className="no-results-message">لم تقم بشراء أي كورسات بعد.</div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <CourseCard key={course._id} course={course} isMyCourseCard={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage; 