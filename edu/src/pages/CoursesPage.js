import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCourses, getCategories } from '../services/api';
import CourseCard from '../components/CourseCard';
import CourseCardSkeleton from '../components/CourseCardSkeleton';
import './CoursesPage.css';
import { FaSearch, FaGraduationCap, FaBook, FaStar, FaBolt, FaMoneyBillWave } from 'react-icons/fa';
import SubjectCard from '../components/SubjectCard';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const title = "Explore Our Course Catalog";

// Variants for the container of the letters
const sentence = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.2,
      staggerChildren: 0.04,
    },
  },
};

// Variants for each letter
const letter = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// Predefined educational levels
const educationalLevels = [
  { id: 'prep1', name: 'الصف الأول الإعدادي', arabicName: 'أولى إعدادي' },
  { id: 'prep2', name: 'الصف الثاني الإعدادي', arabicName: 'تانية إعدادي' },
  { id: 'prep3', name: 'الصف الثالث الإعدادي', arabicName: 'تالتة إعدادي' },
  { id: 'sec1', name: 'الصف الأول الثانوي', arabicName: 'أولى ثانوي' },
  { id: 'sec2', name: 'الصف الثاني الثانوي', arabicName: 'تانية ثانوي' },
  { id: 'sec3', name: 'الصف الثالث الثانوي', arabicName: 'تالتة ثانوي' }
];

const priceFilters = [
  { id: 'all', label: 'الكل' },
  { id: 'free', label: 'مجاني' },
  { id: 'paid', label: 'مدفوع' }
];

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [showCount, setShowCount] = useState(9); // For pagination
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coursesPromise = getCourses();
        const categoriesPromise = getCategories();
        const [coursesData, categoriesData] = await Promise.all([coursesPromise, categoriesPromise]);
        const coursesArray = coursesData.products || coursesData;
        setCourses(coursesArray);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError('فيه مشكلة حصلت، حاول تاني بعد شوية.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update subjects when level changes
  useEffect(() => {
    if (selectedLevel) {
      const levelSubjects = categories.filter(cat => cat.level === selectedLevel);
      setSubjects(levelSubjects);
      setSelectedSubject('All');
    } else {
      setSubjects([]);
      setSelectedSubject('All');
    }
  }, [selectedLevel, categories]);

  // Filtering logic
  useEffect(() => {
    let results = courses;
    if (selectedLevel) {
      results = results.filter(course => course.level === selectedLevel);
    }
    if (selectedSubject !== 'All') {
      results = results.filter(course => course.category && course.category._id === selectedSubject);
    }
    if (selectedPrice === 'free') {
      results = results.filter(course => course.price === 0);
    } else if (selectedPrice === 'paid') {
      results = results.filter(course => course.price > 0);
    }
    if (searchTerm) {
      results = results.filter(course =>
        course && course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCourses(results);
  }, [searchTerm, selectedLevel, selectedSubject, selectedPrice, courses]);

  // Animation variants
  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: 'spring', bounce: 0.18 } },
  };

  // Skeleton loader
  const renderSkeletons = () => (
    <div className="courses-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );

  // Pagination logic
  const handleShowMore = () => setShowCount(count => count + 9);

  if (loading && !selectedLevel) {
    return (
        <div className="courses-page">
            <div className="courses-header-hero">
                <motion.h1
                    className="animated-title"
                    variants={sentence}
                    initial="hidden"
                    animate="visible"
                >
                  {title.split("").map((char, index) => {
                    return (
                      <motion.span key={char + "-" + index} variants={letter}>
                        {char}
                      </motion.span>
                    )
                  })}
                </motion.h1>
                <p>اكتشف كل الكورسات اللي ممكن تبدأ بيها رحلتك.</p>
            </div>
            <div className="search-and-filter-bar">
                <div className="search-container">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="دور على كورس..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
            </div>
            {renderSkeletons()}
        </div>
    );
  }

  if (error) return <div className="error-message">{error}</div>;

  const renderCourses = () => {
    if (loading) {
      return renderSkeletons();
    }

    if (selectedSubject !== 'All') {
      if (filteredCourses.length > 0) {
        return (
          <motion.div
            className="courses-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredCourses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </motion.div>
        );
      } else {
        return <p className="no-results-message">لا توجد كورسات متاحة لهذه المادة حالياً.</p>;
      }
    }

    if (!selectedLevel) {
      return (
        <p className="no-results-message" style={{ marginTop: '2rem' }}>
          الرجاء اختيار مرحلة تعليمية لعرض المواد المتاحة.
        </p>
      );
    }
    
    // If a level is selected but not a subject yet, we don't show courses
    // This part can be left empty or show another message if desired
    return null;
  };

  return (
    <div className="courses-page">
      <div className="courses-header-hero">
        <motion.h1
            className="animated-title"
            variants={sentence}
            initial="hidden"
            animate="visible"
        >
          {title.split("").map((char, index) => {
            return (
              <motion.span key={char + "-" + index} variants={letter}>
                {char}
              </motion.span>
            )
          })}
        </motion.h1>
        <p>اكتشف كل الكورسات اللي ممكن تبدأ بيها رحلتك.</p>
      </div>
      <div className="search-and-filter-bar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="دور على كورس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      <div className="level-filters">
        <h3><FaGraduationCap /> اختر المرحلة التعليمية:</h3>
        <div className="level-buttons">
          {educationalLevels.map(level => (
            <button
              key={level.id}
              className={`level-button${selectedLevel === level.id ? ' active' : ''}`}
              onClick={() => setSelectedLevel(level.id)}
            >
              {level.arabicName}
            </button>
          ))}
        </div>
      </div>
      {selectedLevel && subjects.length > 0 && (
        <div className="subject-filters">
          <h3><FaBook /> المواد</h3>
          <div className="subject-buttons">
            <button
              className={`subject-button${selectedSubject === 'All' ? ' active' : ''}`}
              onClick={() => setSelectedSubject('All')}
            >
              الكل
            </button>
            {subjects.map(subject => (
              <button
                key={subject._id}
                className={`subject-button${selectedSubject === subject._id ? ' active' : ''}`}
                onClick={() => setSelectedSubject(subject._id)}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="courses-grid">
        {!selectedLevel ? (
          <div className="no-results-message">اختار المرحلة التعليمية الأول عشان تشوف المواد والكورسات.</div>
        ) : selectedSubject !== 'All' && filteredCourses.length === 0 ? (
          <div className="no-results-message">مفيش كورسات متاحة للمادة دي.</div>
        ) : (
          filteredCourses.slice(0, showCount).map(course => (
            <CourseCard key={course._id} course={course} />
          ))
        )}
      </div>
      {!loading && filteredCourses.length > showCount && (
        <button className="show-more-btn" onClick={handleShowMore}>عرض أكتر</button>
      )}
    </div>
  );
};

export default CoursesPage; 