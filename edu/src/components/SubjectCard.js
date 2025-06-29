import React from 'react';
import { motion } from 'framer-motion';
import './SubjectCard.css';
import { FaStar, FaBookOpen } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009';

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: 'spring', bounce: 0.18 } },
  hover: { scale: 1.025, boxShadow: '0 8px 32px rgba(90,79,207,0.10), 0 2px 8px rgba(156,39,176,0.10)', y: -2 },
};

const SubjectCard = ({ subject, onClick, selected, onShowCourses, courseCount = 0 }) => {
  // Construct the full image URL if image exists
  const imageUrl = subject.image ?
    (subject.image.startsWith('http') ? subject.image : `${API_URL}/${subject.image}`)
    : null;

  return (
    <motion.div
      className={`subject-card-elegant${selected ? ' selected' : ''}`}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      onClick={() => onClick && onClick(subject)}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      <div className="subject-card-elegant-img-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={subject.name} className="subject-card-elegant-img" />
        ) : (
          <div className="subject-card-elegant-placeholder">📚</div>
        )}
        {subject.isMain && (
          <span className="subject-card-badge"><FaStar style={{marginLeft: 4}}/> مادة أساسية</span>
        )}
      </div>
      <div className="subject-card-elegant-content">
        <div className="subject-card-elegant-title">{subject.name}</div>
        {subject.description && (
          <div className="subject-card-elegant-desc">{subject.description}</div>
        )}
        
        {/* Simple Lesson Count */}
        <div className="subject-card-elegant-stats">
          <div className="lesson-count">
            <FaBookOpen className="lesson-count-icon" />
            <span className="lesson-count-text">{courseCount} درس</span>
          </div>
        </div>
        
        <motion.button
          className="subject-card-elegant-btn"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.97 }}
          onClick={e => { e.stopPropagation(); if (onShowCourses) onShowCourses(subject); else if (onClick) onClick(subject); }}
        >
          عرض الكورسات
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SubjectCard; 