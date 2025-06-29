import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaUserPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EGYPT_GOVS = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة', 'الفيوم',
  'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد',
  'السويس', 'اسوان', 'اسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا', 'شمال سيناء', 'سوهاج'
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    governorate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await registerUser(form);
      authLogin(data.user, data.token);
      setSuccess('تم التسجيل بنجاح!');
      setTimeout(() => {
        navigate('/login');
      }, 800);
    } catch (err) {
      setError(err.message || 'فشل التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      <motion.div className="register-split-card" variants={cardVariants} initial="hidden" animate="visible">
        <div className="register-left-panel">
          <h2>Welcome Back!</h2>
          <p>Enter your personal details to use all of site features</p>
          <Link to="/login" className="register-panel-btn">SIGN IN</Link>
        </div>
        <div className="register-right-panel">
          <div className="register-title">
            <FaUserPlus style={{marginBottom: '-4px', marginRight: '7px', color: '#5a4fcf'}}/> Create Account
          </div>
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-form-group">
              <label>Name</label>
              <div className="input-icon-group">
                <FaUser className="input-icon" />
                <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your Name" />
              </div>
            </div>
            <div className="register-form-group">
              <label>Email</label>
              <div className="input-icon-group">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" />
              </div>
            </div>
            <div className="register-form-group">
              <label>Password</label>
              <div className="input-icon-group">
                <FaLock className="input-icon" />
                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Password" />
              </div>
            </div>
            <div className="register-form-group">
              <label>Phone</label>
              <div className="input-icon-group">
                <FaPhone className="input-icon" />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="0100 000 0000" />
              </div>
            </div>
            <div className="register-form-group">
              <label>Governorate</label>
              <div className="input-icon-group">
                <FaMapMarkerAlt className="input-icon" />
                <select name="governorate" value={form.governorate} onChange={handleChange} required>
                  <option value="">Select governorate</option>
                  {EGYPT_GOVS.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div className="register-form-error">{error}</div>}
            {success && <div className="register-form-success">{success}</div>}
            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
            <div className="register-alt-link">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
