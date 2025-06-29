import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/api';
import CourseCard from '../components/CourseCard';
import './HomePage.css';
import { FaChalkboardTeacher, FaCertificate, FaHeadset, FaUsers, FaVideo, FaStar, FaBook, FaCode, FaAtom, FaPencilAlt, FaLightbulb, FaLaptopCode } from 'react-icons/fa';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

// Let's assume we will add an image named 'hero-graphic.png' to 'edu/src/assets/images/'
// import heroImage from '../assets/images/hero-graphic.png'; 

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        // Assuming the API returns an array of courses directly
        const data = response.products || response; // Adjust based on actual API response
        setFeaturedCourses(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch courses for homepage:', err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section-new">
        <div className="floating-icons-container">
          <FaBook className="floating-icon icon-1" />
          <FaCode className="floating-icon icon-2" />
          <FaAtom className="floating-icon icon-3" />
          <FaPencilAlt className="floating-icon icon-4" />
          <FaLightbulb className="floating-icon icon-5" />
        </div>
        <div className="hero-content-split">
            <motion.div 
                className="hero-text"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.h1 variants={itemVariants} className="hero-title-gradient">
                    Your Journey to <br /> Knowledge Starts Here
                </motion.h1>
                <motion.p variants={itemVariants} className="hero-subtitle">
                    Explore a universe of expert-led courses and unlock your true potential. Creative, flexible, and designed for you.
                </motion.p>
                <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/courses" className="hero-cta-new">
                    Discover Courses
                    </Link>
                </motion.div>
            </motion.div>
            <div className="hero-graphic">
                <motion.div
                    className="hero-main-icon-container"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                >
                    <FaLaptopCode className="hero-main-icon" />
                </motion.div>
            </div>
        </div>
      </section>

      <section className="why-choose-us">
        <h2 className="section-title">Why EduPlatform?</h2>
        <motion.div 
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div variants={itemVariants} className="feature-card">
            <FaChalkboardTeacher className="feature-icon" />
            <h3>Expert Instructors</h3>
            <p>Learn from industry professionals who are passionate about teaching.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="feature-card">
            <FaCertificate className="feature-icon" />
            <h3>Verified Certificates</h3>
            <p>Earn certificates that are recognized and valued by employers.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="feature-card">
            <FaHeadset className="feature-icon" />
            <h3>24/7 Support</h3>
            <p>Our dedicated team is here to help you anytime, anywhere.</p>
          </motion.div>
        </motion.div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <motion.div className="stat-item" variants={itemVariants}>
            <FaUsers className="stat-icon" />
            <div className="stat-numbers">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Active Students</span>
            </div>
          </motion.div>
          <motion.div className="stat-item" variants={itemVariants}>
            <FaVideo className="stat-icon" />
            <div className="stat-numbers">
              <span className="stat-number">500+</span>
              <span className="stat-label">Total Courses</span>
            </div>
          </motion.div>
          <motion.div className="stat-item" variants={itemVariants}>
            <FaStar className="stat-icon" />
            <div className="stat-numbers">
              <span className="stat-number">4.9/5</span>
              <span className="stat-label">Average Rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="featured-courses">
        <h2 className="section-title">Featured Courses</h2>
        <div className="courses-grid">
          {featuredCourses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-title">What Our Students Say</h2>
        <motion.div 
            className="testimonials-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="testimonial-card" variants={itemVariants}>
            <p className="testimonial-text">"This platform transformed my career. The courses are practical and the instructors are top-notch!"</p>
            <div className="testimonial-author">
              <img src="https://i.pravatar.cc/150?img=1" alt="Sarah L." className="author-avatar" />
              <div className="author-info">
                <span className="author-name">Sarah L.</span>
                <span className="author-role">Software Engineer</span>
              </div>
            </div>
          </motion.div>
          <motion.div className="testimonial-card" variants={itemVariants}>
            <p className="testimonial-text">"I finally understood complex topics I've struggled with for years. Highly recommended!"</p>
            <div className="testimonial-author">
              <img src="https://i.pravatar.cc/150?img=2" alt="Mike P." className="author-avatar" />
              <div className="author-info">
                <span className="author-name">Mike P.</span>
                <span className="author-role">Data Scientist</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage; 