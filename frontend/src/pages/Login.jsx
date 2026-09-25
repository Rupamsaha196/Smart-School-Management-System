import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineAcademicCap, HiOutlineEye, HiOutlineEyeSlash, HiOutlineShieldCheck } from 'react-icons/hi2';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const { login, twoFactorPending, verifyTwoFactor, cancelTwoFactor } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.twoFactorRequired) {
        toast('Enter your 2FA code to continue', { icon: '🔐' });
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      const result = await login(demoEmail, demoPassword);
      if (result?.twoFactorRequired) {
        toast('Enter your 2FA code to continue', { icon: '🔐' });
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    if (twoFactorCode.length < 6) {
      toast.error('Enter a valid 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await verifyTwoFactor(twoFactorCode);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb orb-1"></div>
        <div className="login-bg-orb orb-2"></div>
        <div className="login-bg-orb orb-3"></div>
      </div>

      <div className="login-container animate-slideUp">
        <div className="login-card card-glass">
          {/* Logo */}
          <div className="login-header">
            <div className="login-logo">
              <HiOutlineAcademicCap size={32} />
            </div>
            <h1>Smart School</h1>
            <p>School Management System</p>
          </div>

          {/* 2FA Verification Form */}
          {twoFactorPending ? (
            <form onSubmit={handleTwoFactorSubmit} className="login-form">
              <div className="text-center mb-4">
                <HiOutlineShieldCheck size={48} className="text-primary-400 mx-auto mb-2" />
                <h3 className="text-h4 mb-1">Two-Factor Authentication</h3>
                <p className="text-xs text-secondary">Enter the 6-digit code from your authenticator app</p>
              </div>

              <div className="form-group">
                <input
                  id="two-factor-code"
                  type="text"
                  className="form-input text-center"
                  placeholder="000000"
                  maxLength="6"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  style={{ letterSpacing: '0.5em', fontSize: '1.5rem' }}
                  autoFocus
                />
              </div>

              <button
                id="two-factor-submit"
                type="submit"
                className={`btn btn-primary btn-lg w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </button>

              <button
                type="button"
                className="btn btn-ghost w-full mt-2"
                onClick={() => { cancelTwoFactor(); setTwoFactorCode(''); }}
              >
                ← Back to Login
              </button>
            </form>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="admin@smartschool.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                className={`btn btn-primary btn-lg w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Demo credentials — only show on login step */}
          {!twoFactorPending && (
            <div className="login-demo">
              <p className="text-xs text-tertiary">Demo Credentials</p>
              <div className="demo-accounts">
                <button className="demo-btn" onClick={() => handleDemoLogin('admin@smartschool.com', 'password')}>
                  <span className="badge badge-primary">Admin</span>
                </button>
                <button className="demo-btn" onClick={() => handleDemoLogin('teacher@smartschool.com', 'password')}>
                  <span className="badge badge-success">Teacher</span>
                </button>
                <button className="demo-btn" onClick={() => handleDemoLogin('accountant@smartschool.com', 'password')}>
                  <span className="badge badge-warning">Accountant</span>
                </button>
                <button className="demo-btn" onClick={() => handleDemoLogin('parent@smartschool.com', 'password')}>
                  <span className="badge badge-info">Parent</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="login-footer text-xs text-tertiary">
          © 2026 Infosof Technologies — Smart School v1.0
        </p>
      </div>
    </div>
  );
}
