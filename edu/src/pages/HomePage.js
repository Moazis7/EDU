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
                    رحلتك للعلم بتبدأ من هنا
                </motion.h1>
                <motion.p variants={itemVariants} className="hero-subtitle">
                    اكتشف كورسات جامدة مع مدرسين خبرة، وحقق اللي بتحلم بيه! كل حاجة مرنة وسهلة ليك.
                </motion.p>
                <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/courses" className="hero-cta-new">
                    شوف الكورسات
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
        <h2 className="section-title">ليه تختار منصتنا؟</h2>
        <motion.div 
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div variants={itemVariants} className="feature-card">
            <FaChalkboardTeacher className="feature-icon" />
            <h3>مدرسين جامدين</h3>
            <p>هتتعلم من ناس فاهمة وبتحب تشرح بجد.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="feature-card">
            <FaCertificate className="feature-icon" />
            <h3>شهادات معتمدة</h3>
            <p>خد شهادة عليها القيمة تفرق معاك في الشغل.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="feature-card">
            <FaHeadset className="feature-icon" />
            <h3>دعم 24 ساعة</h3>
            <p>أي وقت تحتاجنا فيه، هتلاقينا معاك.</p>
          </motion.div>
        </motion.div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <motion.div className="stat-item" variants={itemVariants}>
            <FaUsers className="stat-icon" />
            <div className="stat-numbers">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">طلبة معانا</span>
            </div>
          </motion.div>
          <motion.div className="stat-item" variants={itemVariants}>
            <FaVideo className="stat-icon" />
            <div className="stat-numbers">
              <span className="stat-number">500+</span>
              <span className="stat-label">كورس متاح</span>
            </div>
          </motion.div>
          <motion.div className="stat-item" variants={itemVariants}>
            <FaStar className="stat-icon" />
            <div className="stat-numbers">
              <span className="stat-number">4.9/5</span>
              <span className="stat-label">تقييم الناس</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="featured-courses">
        <h2 className="section-title">كورسات مميزة</h2>
        <div className="courses-grid">
          {featuredCourses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-title">آراء الطلبة فينا</h2>
        <motion.div 
            className="testimonials-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="testimonial-card" variants={itemVariants}>
            <p className="testimonial-text">"المنصة دي فرقت معايا جدًا! الكورسات عملية والمدرسين بيشرحوا بطريقة سهلة."</p>
            <div className="testimonial-author">
              <img src="https://i.pravatar.cc/150?img=1" alt="Sarah L." className="author-avatar" />
              <div className="author-info">
                <span className="author-name">سارة</span>
                <span className="author-role">مبرمجة</span>
              </div>
            </div>
          </motion.div>
          <motion.div className="testimonial-card" variants={itemVariants}>
            <p className="testimonial-text">"فهمت حاجات كنت فاكرها صعبة بفضل الشرح هنا. أنصح أي حد يجرب بنفسه!"</p>
            <div className="testimonial-author">
              <img src="https://i.pravatar.cc/150?img=2" alt="Mike P." className="author-avatar" />
              <div className="author-info">
                <span className="author-name">مايكل</span>
                <span className="author-role">عالم بيانات</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage; 