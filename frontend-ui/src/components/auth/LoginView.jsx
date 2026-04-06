import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginView({ title, subtitle, idPlacholder, idLabel, isUserLogin = true }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic frontend validation
    if (!formData.id || !formData.password) {
      setLoading(false);
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password.length < 5) {
      setLoading(false);
      setError('Invalid credentials.');
      return;
    }

    // Mock authentication
    setTimeout(() => {
      setLoading(false);
      // On success, set auth state and redirect to dashboard
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', isUserLogin ? 'user' : 'admin');
      navigate('/');
    }, 1000);
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo-emblem">⊛</div>
          <div>
            <h1 className="auth-logo-name">BHUMI REGISTRY</h1>
            <p className="auth-logo-dept">Ministry of Rural Development</p>
          </div>
        </div>

        <div className="card auth-card">
          <div className="auth-header">
            <h2 className="page-title">{title}</h2>
            <p className="page-subtitle">{subtitle}</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <span>{error}</span>
            </div>
          )}

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="field-label">{idLabel || (isUserLogin ? 'Email / Username' : 'Admin ID / Email')}</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="field-input"
                placeholder={idPlacholder}
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="field-label">Password</label>
                {isUserLogin && (
                  <a href="#" className="auth-link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
                )}
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="field-input"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            {isUserLogin && (
              <div className="form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input type="checkbox" id="rememberMe" />
                <label htmlFor="rememberMe" className="field-hint" style={{ fontSize: '13px' }}>Remember me</label>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', width: '100%' }} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '15px', height: '15px', borderWidth: '2px' }}></div>
                  Authenticating...
                </>
              ) : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-footer">
            {isUserLogin ? (
               <p className="field-hint">Are you an administrator? <span className="auth-link" onClick={() => navigate('/admin/login')}>Admin Login</span></p>
            ) : (
               <p className="field-hint">Are you a citizen? <span className="auth-link" onClick={() => navigate('/login')}>User Login</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
