import React from 'react';
import './CourseCardSkeleton.css';

const CourseCardSkeleton = () => {
  return (
    <div className="course-card-skeleton">
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text skeleton-text-short"></div>
        <div className="skeleton-footer">
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton; 