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
      setSuccess('تم تسجيلك! هتتحول على صفحة الدخول...');
      setTimeout(() => {
        navigate('/login');
      }, 800);
    } catch (err) {
      setError(err.message || 'فيه مشكلة في البيانات، جرب تاني!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <motion.div className="login-split-card" variants={cardVariants} initial="hidden" animate="visible">
        <div className="login-left-panel">
          <h2 className="register-title">يلا نعمل حساب جديد!</h2>
          <p>Already have an account? Sign in to access your dashboard.</p>
          <Link to="/login" className="login-panel-btn">SIGN IN</Link>
        </div>
        <div className="login-right-panel">
          <div className="login-title">
            <FaUserPlus style={{marginBottom: '-4px', marginRight: '7px', color: 'var(--primary-color)'}}/> Create Account
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label>Name</label>
              <div className="input-icon-group">
                <FaUser className="input-icon" />
                <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="اسمك بالكامل..." />
              </div>
            </div>
            <div className="login-form-group">
              <label>Email</label>
              <div className="input-icon-group">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="ايميلك..." />
              </div>
            </div>
            <div className="login-form-group">
              <label>Password</label>
              <div className="input-icon-group">
                <FaLock className="input-icon" />
                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="كلمة السر..." />
              </div>
            </div>
            <div className="login-form-group">
              <label>Phone</label>
              <div className="input-icon-group">
                <FaPhone className="input-icon" />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="موبايلك..." />
              </div>
            </div>
            <div className="login-form-group">
              <label>Governorate</label>
              <div className="input-icon-group">
                <FaMapMarkerAlt className="input-icon" />
                <select name="governorate" value={form.governorate} onChange={handleChange} required>
                  <option value="">المحافظة...</option>
                  {EGYPT_GOVS.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div className="error-message">{error === 'فشل التسجيل' ? 'فيه مشكلة في البيانات، جرب تاني!' : error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? 'ثانية واحدة...' : 'سجل حسابك'}
            </button>
          </form>
          <div className="login-link">
            عندك حساب؟ <Link to="/login">ادخل من هنا</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
