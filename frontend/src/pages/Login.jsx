import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/map');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

        :root {
          --red: #E8231A;
          --orange: #F57C2B;
          --yellow: #F5C842;
          --dark: #0D0D0D;
          --darker: #080808;
          --mid: #1A1A1A;
          --card: #141414;
          --border: #2A2A2A;
          --text: #E8E4DC;
          --muted: #7A7570;
          --green: #2ECC71;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: var(--dark);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          overflow: hidden;
        }

        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 999;
          opacity: 0.4;
        }

        /* Left - branding */
        .login-left {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px 60px 60px 70px;
          position: relative;
          z-index: 2;
          border-right: 1px solid var(--border);
        }

        .login-left::before {
          content: '';
          position: absolute;
          bottom: -200px; left: -200px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,35,26,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-tag {
          display: inline-block;
          background: rgba(232,35,26,0.15);
          border: 1px solid rgba(232,35,26,0.4);
          color: var(--red);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 2px;
          margin-bottom: 28px;
          width: fit-content;
        }

        .brand-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(64px, 6vw, 96px);
          line-height: 0.9;
          letter-spacing: -1px;
        }
        .brand-title span { color: var(--red); display: block; }

        .brand-sub {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.65;
          max-width: 360px;
          margin-top: 20px;
          font-weight: 300;
        }

        .brand-stats {
          display: flex;
          gap: 36px;
        }
        .stat-block { border-left: 2px solid var(--border); padding-left: 16px; }
        .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: var(--orange); line-height: 1; }
        .stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 3px; }

        /* Right - form */
        .login-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          position: relative;
          z-index: 2;
          background: var(--mid);
        }

        .login-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 80% 20%, rgba(232,35,26,0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .form-wrap {
          width: 100%;
          max-width: 380px;
          animation: fadeUp 0.5s ease both;
          position: relative;
          z-index: 1;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }

        .form-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .form-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px;
          letter-spacing: 1px;
          color: var(--text);
          margin-bottom: 32px;
          line-height: 1;
        }

        .dl-field { margin-bottom: 18px; }
        .dl-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 1px;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .dl-input {
          width: 100%;
          padding: 13px 16px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          outline: none;
          transition: border-color 0.2s;
        }
        .dl-input:focus { border-color: var(--red); }
        .dl-input::placeholder { color: #3a3a3a; }

        .dl-error {
          background: rgba(232,35,26,0.1);
          border: 1px solid rgba(232,35,26,0.3);
          color: var(--red);
          padding: 10px 14px;
          border-radius: 4px;
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 20px;
        }

        .dl-btn {
          width: 100%;
          padding: 14px;
          background: var(--red);
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s, transform 0.1s;
        }
        .dl-btn:hover { background: #c41d15; }
        .dl-btn:active { transform: scale(0.99); }
        .dl-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .form-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--muted);
          font-family: 'JetBrains Mono', monospace;
        }
        .form-footer a { color: var(--red); text-decoration: none; }
        .form-footer a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 40px 24px; }
        }
      `}</style>

      <div className="login-root">
        {/* Left */}
        <div className="login-left">
          <div>
            <div className="brand-tag">Disaster Relief Platform</div>
            <div className="brand-title">DISASTER<span>LINK</span></div>
            <p className="brand-sub">Coordinating relief efforts in real-time. Connecting victims, volunteers, and NGOs when it matters most.</p>
          </div>
          <div className="brand-stats">
            <div className="stat-block">
              <div className="stat-num">3</div>
              <div className="stat-label">User Roles</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">Live</div>
              <div className="stat-label">Map Tracking</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">SOS</div>
              <div className="stat-label">Real-time Alerts</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="login-right">
          <div className="form-wrap">
            <div className="form-eyebrow">Welcome back</div>
            <div className="form-title">SIGN IN</div>

            {error && <div className="dl-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="dl-field">
                <label className="dl-label">Email</label>
                <input className="dl-input" type="email" name="email"
                  placeholder="you@example.com" value={form.email}
                  onChange={handleChange} autoComplete="off" required />
              </div>
              <div className="dl-field">
                <label className="dl-label">Password</label>
                <input className="dl-input" type="password" name="password"
                  placeholder="••••••••" value={form.password}
                  onChange={handleChange} autoComplete="new-password" required />
              </div>
              <button className="dl-btn" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <div className="form-footer">
              No account? <Link to="/register">Register here</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;