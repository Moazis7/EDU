import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './SubjectCard.css';
import { FaBookOpen } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009';

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: 'spring', bounce: 0.18 } },
  hover: { scale: 1.035, boxShadow: '0 16px 48px rgba(90,79,207,0.13), 0 4px 16px rgba(156,39,176,0.13)', y: -6 },
};

const SubjectCard = ({ subject, onClick, selected, courseCount = 0 }) => {
  const navigate = useNavigate();
  // Construct the full image URL if image exists
  const imageUrl = subject.image ?
    (subject.image.startsWith('http') ? subject.image : `${API_URL}/${subject.image}`)
    : null;

  return (
    <motion.div
      className={`subject-modern-card-rect${selected ? ' selected' : ''}`}
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
      <div className="subject-modern-image-rect-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt={subject.name} className="subject-modern-image-rect" />
        ) : (
          <div className="subject-modern-placeholder-rect">📚</div>
        )}
        <span className="subject-modern-category">{subject.name}</span>
      </div>
      <div className="subject-modern-content-rect">
        {subject.description && (
          <div className="subject-modern-desc-rect">{subject.description}</div>
        )}
        <div className="subject-modern-stats-rect" style={{pointerEvents: 'none'}}>
          <FaBookOpen className="subject-modern-icon-rect" />
          <span>{courseCount} كورس</span>
        </div>
        <motion.button
          className="subject-modern-btn-rect"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.97 }}
          onClick={e => { e.stopPropagation(); navigate(`/subject/${subject._id}`); }}
        >
          عرض الكورسات
        </motion.button>
      </div>
      <div className="subject-card-details">
        <div className="subject-card-title subject-badge-orange">{subject.name}</div>
        <div className="subject-card-courses-count">{courseCount} كورس</div>
      </div>
    </motion.div>
  );
};

export default SubjectCard; 