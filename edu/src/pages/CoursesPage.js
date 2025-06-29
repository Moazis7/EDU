import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCourses, getCategories } from '../services/api';
import CourseCard from '../components/CourseCard';
import './CoursesPage.css';
import { FaSearch, FaGraduationCap, FaBook } from 'react-icons/fa';
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
  { id: 'prep1', name: 'الصف الأول الإعدادي', arabicName: 'الصف الأول الإعدادي' },
  { id: 'prep2', name: 'الصف الثاني الإعدادي', arabicName: 'الصف الثاني الإعدادي' },
  { id: 'prep3', name: 'الصف الثالث الإعدادي', arabicName: 'الصف الثالث الإعدادي' },
  { id: 'sec1', name: 'الصف الأول الثانوي', arabicName: 'الصف الأول الثانوي' },
  { id: 'sec2', name: 'الصف الثاني الثانوي', arabicName: 'الصف الثاني الثانوي' },
  { id: 'sec3', name: 'الصف الثالث الثانوي', arabicName: 'الصف الثالث الثانوي' }
];

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [subjects, setSubjects] = useState([]);
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
        setFilteredCourses(coursesArray);
        setCategories(categoriesData);

        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update subjects when level changes
  useEffect(() => {
    if (selectedLevel === 'All') {
      setSubjects([]);
      setSelectedSubject('All');
    } else {
      const levelSubjects = categories.filter(cat => cat.level === selectedLevel);
      setSubjects(levelSubjects);
      setSelectedSubject('All');
    }
  }, [selectedLevel, categories]);

  useEffect(() => {
    let results = courses;

    // Filter by level
    if (selectedLevel !== 'All') {
      results = results.filter(course => course.level === selectedLevel);
    }

    // Filter by subject
    if (selectedSubject !== 'All') {
      results = results.filter(course => course.category && course.category._id === selectedSubject);
    }

    // Filter by search term
    if (searchTerm) {
        results = results.filter(course =>
            course && course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    setFilteredCourses(results);
  }, [searchTerm, selectedLevel, selectedSubject, courses]);

  if (loading) return <div className="loading-message">Loading courses...</div>;
  if (error) return <div className="error-message">{error}</div>;

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
        <p>Find the perfect course to kickstart your learning journey.</p>
      </div>

      <div className="search-and-filter-bar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Educational Level Filters */}
      <div className="level-filters">
        <h3><FaGraduationCap /> Educational Levels</h3>
        <div className="level-buttons">
          <button
            className={`level-button ${selectedLevel === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedLevel('All')}
          >
            All Levels
          </button>
          {educationalLevels.map(level => (
            <button
              key={level.id}
              className={`level-button ${selectedLevel === level.id ? 'active' : ''}`}
              onClick={() => setSelectedLevel(level.id)}
            >
              {level.arabicName}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Filters */}
      {selectedLevel !== 'All' && subjects.length > 0 && (
        <div className="subject-filters">
          <h3><FaBook /> Subjects</h3>
          <div className="subject-cards-grid">
            {subjects.map(subject => {
              // Calculate course count for this subject
              const subjectCourseCount = courses.filter(course => 
                course.category && course.category._id === subject._id
              ).length;
              
              return (
                <SubjectCard
                  key={subject._id}
                  subject={subject}
                  selected={selectedSubject === subject._id}
                  onClick={() => setSelectedSubject(subject._id)}
                  onShowCourses={() => navigate(`/subject/${subject._id}`)}
                  courseCount={subjectCourseCount}
                />
              );
            })}
          </div>
        </div>
      )}

      <motion.div
        className="courses-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))
        ) : (
          <p className="no-results-message">No courses found matching your search.</p>
        )}
      </motion.div>
    </div>
  );
};

export default CoursesPage; 