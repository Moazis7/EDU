import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategories, getCoursesByCategory } from '../services/api';
import CourseCard from '../components/CourseCard';
import { FaBook, FaCode, FaAtom, FaPencilAlt, FaLightbulb } from 'react-icons/fa';
import './SubjectCoursesPage.css';

// Typewriter effect for title (no cursor)
function useTypewriter(text, speed = 45) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(t => t + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

const SubjectCoursesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Call useTypewriter at the top, before any conditional returns
  const typedTitle = useTypewriter(subject?.name || '', 45);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Subject ID is required');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const categories = await getCategories();
        const found = categories.find(cat => cat._id === id);
        setSubject(found);
        
        if (found) {
          const coursesRes = await getCoursesByCategory(id);
          setCourses(coursesRes.products || []);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching subject data:', err);
        setError('حدث خطأ أثناء تحميل البيانات.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // If no previous page, go to subjects page
      navigate('/subjects');
    }
  };

  if (loading) return <div className="loading-message">جاري التحميل...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!subject) return <div className="error-message">لم يتم العثور على المادة.</div>;

  return (
    <div className="subject-courses-simple-page">
      <div className="floating-icons-container">
        <FaBook className="floating-icon icon-1" />
        <FaCode className="floating-icon icon-2" />
        <FaAtom className="floating-icon icon-3" />
        <FaPencilAlt className="floating-icon icon-4" />
        <FaLightbulb className="floating-icon icon-5" />
      </div>
      
      <div className="subject-courses-simple-header">
        <button className="subject-courses-simple-back" onClick={handleBack}>رجوع</button>
        <div className="subject-courses-simple-title">
          <span className="title-icon">📚</span>
          {subject.name ? typedTitle : 'جاري التحميل...'}
        </div>
        {subject.description && (
          <div className="subject-courses-simple-desc">
            <span className="desc-icon">✨</span>
            {subject.description}
          </div>
        )}
      </div>
      <div className="subject-courses-simple-grid">
        {courses.length > 0 ? (
          courses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))
        ) : (
          <div className="no-results-message">لا يوجد كورسات لهذه المادة حالياً.</div>
        )}
      </div>
    </div>
  );
};

export default SubjectCoursesPage; 