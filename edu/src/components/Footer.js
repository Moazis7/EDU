import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-about">
          <Link to="/" className="footer-logo">
            <FaGraduationCap />
            MOisPlatform
          </Link>
          <p>
            معاك في مشوارك للتعلم. عندنا كورسات جامدة تساعدك توصل للي نفسك فيه!
          </p>
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          </div>
        </div>
        <div className="footer-links">
          <h4>لينكات سريعة</h4>
          <ul>
            <li><Link to="/courses">كل الكورسات</Link></li>
            <li><Link to="/about">عن المنصة</Link></li>
            <li><Link to="/contact">اتصل بينا</Link></li>
            <li><Link to="/faq">أسئلة كتير</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>القانوني</h4>
          <ul>
            <li><Link to="/terms">شروط الاستخدام</Link></li>
            <li><Link to="/privacy">سياسة الخصوصية</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>تواصل معانا</h4>
          <p><FaMapMarkerAlt /> المعادي، القاهرة، مصر</p>
          <p><FaEnvelope /> ايميل: moazismail710@gmail.com</p>
          <p><FaPhone /> موبايل: +20 01151430862</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()}  MOisPlatform. كل الحقوق محفوظة. اتعملت بحب بواسطة معاذ إسماعيل &copy;</p>
      </div>
    </footer>
  );
};

export default Footer; 