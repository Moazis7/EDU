import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const [showVideo, setShowVideo] = useState(false);

  const handleVideoClick = (e) => {
    e.preventDefault();
    setShowVideo(!showVideo);
  };

  return (
    <div className="course-card">
      <div className="course-thumbnail">
        {course.video ? (
          <div className="video-thumbnail-container">
            {showVideo ? (
              <VideoPlayer 
                videoUrl={course.video}
                poster={course.thumbnail}
                title={course.title}
              />
            ) : (
              <>
                <img 
                  src={course.thumbnail || '/default-course-thumbnail.jpg'} 
                  alt={course.title} 
                  className="course-image"
                />
                <button 
                  className="play-button"
                  onClick={handleVideoClick}
                  title="Play Preview"
                >
                  ▶️
                </button>
              </>
            )}
          </div>
        ) : (
          <img 
            src={course.thumbnail || '/default-course-thumbnail.jpg'} 
            alt={course.title} 
            className="course-image"
          />
        )}
      </div>
      
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">
          {course.description?.substring(0, 100)}...
        </p>
        
        <div className="course-meta">
          <span className="course-price">${course.price}</span>
          <span className="course-level">{course.level}</span>
          {course.category?.name && (
            <span className="course-category">{course.category.name}</span>
          )}
        </div>
        
        <div className="course-actions">
          <Link to={`/course/${course._id}`} className="view-course-btn">
            View Course
          </Link>
          {course.video && (
            <button 
              className="preview-btn"
              onClick={handleVideoClick}
            >
              {showVideo ? 'Hide Preview' : 'Preview'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard; 