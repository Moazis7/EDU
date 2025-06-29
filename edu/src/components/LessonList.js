import React from 'react';
import { FaPlayCircle, FaLock } from 'react-icons/fa';
import './LessonList.css';

const LessonList = ({ lessons, onLessonClick, activeLessonId }) => {

  if (!lessons || lessons.length === 0) {
    return <p className="no-lessons-message">No lessons available for this course yet.</p>;
  }

  // A real implementation would have purchase status logic
  const isEnrolled = true; 

  const handleLessonClick = (lesson) => {
    if (isEnrolled || lesson.isFree) {
        onLessonClick(lesson);
    } else {
        alert("You must purchase this course to view this lesson.");
    }
  }

  return (
    <div className="lesson-list">
      <h3>Course Content</h3>
      <ul>
        {lessons.map((lesson, index) => (
          <li
            key={lesson._id || index}
            className={`lesson-item ${activeLessonId === lesson._id ? 'active' : ''}`}
            onClick={() => handleLessonClick(lesson)}
          >
            <div className="lesson-info">
              <span className="lesson-index">{index + 1}</span>
              <p className="lesson-title">{lesson.title}</p>
            </div>
            <div className="lesson-meta">
              <span className="lesson-duration">{lesson.duration || '5:00'}</span>
              {isEnrolled || lesson.isFree ? <FaPlayCircle className="play-icon" /> : <FaLock className="lock-icon" />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LessonList; 