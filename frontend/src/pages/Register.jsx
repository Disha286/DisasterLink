import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'victim', phone:'', location:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    await API.post('/auth/register', form);
    // Auto-login after register
    const res = await API.post('/auth/login', { email: form.email, password: form.password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    const { role } = res.data.user;
    if (role === 'volunteer') navigate('/volunteer');
    else if (role === 'ngo') navigate('/ngo');
    else navigate('/map');
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
  } finally {
    setLoading(false);
  }
};
  const roles = [
    { value:'victim', label:'Victim', desc:'I need help', icon:'🆘', activeColor:'rgba(232,35,26,0.15)', activeBorder:'rgba(232,35,26,0.5)' },
    { value:'volunteer', label:'Volunteer', desc:'I want to help', icon:'🤝', activeColor:'rgba(46,204,113,0.12)', activeBorder:'rgba(46,204,113,0.4)' },
    { value:'ngo', label:'NGO', desc:'We coordinate', icon:'🏥', activeColor:'rgba(245,124,43,0.12)', activeBorder:'rgba(245,124,43,0.4)' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

        :root {
          --red: #E8231A; --orange: #F57C2B; --dark: #0D0D0D;
          --mid: #1A1A1A; --card: #141414; --border: #2A2A2A;
          --text: #E8E4DC; --muted: #7A7570; --green: #2ECC71;
        }

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .reg-root {
          min-height: 100vh;
          background: var(--dark);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        .reg-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 999; opacity: 0.4;
        }

        /* Header */
        .reg-header {
          padding: 28px 70px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative; z-index: 2;
        }
        .reg-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 1px;
          color: var(--text);
        }
        .reg-logo span { color: var(--red); }
        .reg-header-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          color: var(--muted);
          text-transform: uppercase;
        }

        /* Main */
        .reg-main {
          flex:1;
          display:flex;
          align-items:flex-start;
          justify-content:center;
          padding:48px 24px 80px; 
          position:relative; 
          z-index:2; 
          overflow-y:auto; 
          max-height:calc(100vh - 56px); 
          }
          
        .reg-main::before {
          content: '';
          position: absolute;
          top: -100px; right: -200px;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,35,26,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .reg-card {
          width: 100%;
          max-width: 500px;
          animation: fadeUp 0.4s ease both;
          position: relative; z-index: 1;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }

        .form-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 3px;
          color: var(--muted); text-transform: uppercase; margin-bottom: 8px;
        }
        .form-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 52px; letter-spacing: 1px;
          color: var(--text); margin-bottom: 36px; line-height: 1;
        }

        /* Role selector */
        .section-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          margin-top: 28px;
        }
        .section-divider-line { flex: 1; height: 1px; background: var(--border); }
        .section-divider-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 2px;
          color: var(--muted); text-transform: uppercase; white-space: nowrap;
        }

        .role-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 4px; }
        .role-card {
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 16px 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--card);
          text-align: center;
        }
        .role-card:hover { border-color: var(--red); }
        .role-icon { font-size: 22px; margin-bottom: 8px; }
        .role-name { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .role-desc { font-size: 11px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .dl-field { margin-bottom: 14px; }
        .dl-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 1px;
          color: var(--muted); text-transform: uppercase; margin-bottom: 8px;
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
          padding: 10px 14px; border-radius: 4px;
          font-size: 13px; font-family: 'JetBrains Mono', monospace;
          margin-bottom: 20px;
        }

        .dl-btn {
          width: 100%; padding: 14px;
          background: var(--red); color: #fff; border: none; border-radius: 4px;
          font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; margin-top: 8px;
          transition: background 0.2s, transform 0.1s;
        }
        .dl-btn:hover { background: #c41d15; }
        .dl-btn:active { transform: scale(0.99); }
        .dl-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .form-footer {
          text-align: center; margin-top: 24px;
          font-size: 13px; color: var(--muted);
          font-family: 'JetBrains Mono', monospace;
        }
        .form-footer a { color: var(--red); text-decoration: none; }
        .form-footer a:hover { text-decoration: underline; }
      `}</style>

      <div className="reg-root">
        <header className="reg-header">
          <div className="reg-logo">DISASTER<span>LINK</span></div>
          <div className="reg-header-tag">Create Account</div>
        </header>

        <main className="reg-main">
          <div className="reg-card">
            <div className="form-eyebrow">Get started</div>
            <div className="form-title">CREATE ACCOUNT</div>

            {error && <div className="dl-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Role selector */}
              <div className="section-divider">
                <div className="section-divider-line" />
                <div className="section-divider-label">I am a —</div>
                <div className="section-divider-line" />
              </div>
              <div className="role-grid">
                {roles.map(r => (
                  <div key={r.value} className="role-card"
                    onClick={() => setForm({ ...form, role: r.value })}
                    style={form.role === r.value ? { borderColor: r.activeBorder, background: r.activeColor } : {}}>
                    <div className="role-icon">{r.icon}</div>
                    <div className="role-name">{r.label}</div>
                    <div className="role-desc">{r.desc}</div>
                  </div>
                ))}
              </div>

              {/* Personal info */}
              <div className="section-divider" style={{ marginTop: 28 }}>
                <div className="section-divider-line" />
                <div className="section-divider-label">Personal Info</div>
                <div className="section-divider-line" />
              </div>

              <div className="dl-field">
                <label className="dl-label">Full Name</label>
                <input className="dl-input" type="text" name="name" placeholder="Your full name"
                  value={form.name} onChange={handleChange} required />
              </div>
              <div className="dl-field">
                <label className="dl-label">Email</label>
                <input className="dl-input" type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="dl-field">
                <label className="dl-label">Password</label>
                <input className="dl-input" type="password" name="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} required />
              </div>
              <div className="grid-2">
                <div className="dl-field">
                  <label className="dl-label">Phone</label>
                  <input className="dl-input" type="text" name="phone" placeholder="9999999999"
                    value={form.phone} onChange={handleChange} />
                </div>
                <div className="dl-field">
                  <label className="dl-label">Location</label>
                  <input className="dl-input" type="text" name="location" placeholder="Your city"
                    value={form.location} onChange={handleChange} />
                </div>
              </div>

              <button className="dl-btn" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>

            <div className="form-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Register;