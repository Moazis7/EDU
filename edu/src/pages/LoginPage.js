import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const LoginPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
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
      const data = await login(form);
      // استخدام AuthContext بدلاً من localStorage مباشرة
      authLogin(data.user, data.token);
      setSuccess('دخولك تم بنجاح! بنجهزلك الصفحة...');
      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (err) {
      setError(err.message || 'فيه حاجة غلط في البيانات، جرب تاني!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <motion.div className="login-split-card" variants={cardVariants} initial="hidden" animate="visible">
        <div className="login-left-panel">
          <h2>يلا بينا نسجل دخولك!</h2>
          <p>Register now to enjoy all features of the site</p>
          <Link to="/register" className="login-panel-btn">SIGN UP</Link>
        </div>
        <div className="login-right-panel">
          <div className="login-title"><FaSignInAlt style={{marginBottom: '-4px', marginRight: '7px', color: '#5a4fcf'}}/> Login</div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label>Email</label>
              <div className="input-icon-group">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="ايميلك هنا..." />
              </div>
            </div>
            <div className="login-form-group">
              <label>Password</label>
              <div className="input-icon-group">
                <FaLock className="input-icon" />
                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="كلمة السر..." />
              </div>
            </div>
            {error && <div className="error-message">{error === 'فشل تسجيل الدخول' ? 'فيه حاجة غلط في البيانات، جرب تاني!' : error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button className="login-btn" type="submit" disabled={loading}>
              <FaSignInAlt /> {loading ? 'ثانية واحدة...' : 'ادخل على حسابك'}
            </button>
            <div className="register-link">
              لسه معملتش حساب؟ <Link to="/register">سجل جديد من هنا</Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
