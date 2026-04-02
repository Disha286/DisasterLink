import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const urgencyConfig = {
  critical: { color: '#E8231A', bg: 'rgba(232,35,26,0.1)', border: 'rgba(232,35,26,0.3)' },
  high:     { color: '#F57C2B', bg: 'rgba(245,124,43,0.1)', border: 'rgba(245,124,43,0.3)' },
  medium:   { color: '#F5C842', bg: 'rgba(245,200,66,0.1)', border: 'rgba(245,200,66,0.3)' },
  low:      { color: '#2ECC71', bg: 'rgba(46,204,113,0.1)', border: 'rgba(46,204,113,0.3)' },
};

function VolunteerDashboard() {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('matches');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [profileRes, matchesRes] = await Promise.all([
        API.get('/volunteer/me'),
        API.get('/volunteer/matches')
      ]);
      setProfile(profileRes.data);
      setMatches(matchesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleAvailability = async () => {
    const newStatus = profile.availability === 'available' ? 'offline' : 'available';
    try {
      await API.patch('/volunteer/availability', { availability: newStatus });
      setProfile({ ...profile, availability: newStatus });
    } catch (err) { console.error(err); }
  };

  const assignTask = async (sosId) => {
    try {
      await API.patch(`/volunteer/assign/${sosId}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const completeTask = async (sosId) => {
    try {
      await API.patch(`/volunteer/complete/${sosId}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  const availColor = profile?.availability === 'available' ? '#2ECC71' : profile?.availability === 'deployed' ? '#F57C2B' : '#7A7570';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

        :root {
          --red:#E8231A; --orange:#F57C2B; --yellow:#F5C842;
          --dark:#0D0D0D; --mid:#1A1A1A; --card:#141414;
          --border:#2A2A2A; --text:#E8E4DC; --muted:#7A7570; --green:#2ECC71;
        }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .vd-root {
          min-height:100vh; background:var(--dark); color:var(--text);
          font-family:'DM Sans',sans-serif; display:flex; flex-direction:column;
          position:relative; overflow-x:hidden;
        }
        .vd-root::before {
          content:''; position:fixed; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events:none; z-index:999; opacity:0.4;
        }

        /* Navbar */
        .navbar {
          background:var(--dark); border-bottom:1px solid var(--border);
          padding:0 32px; height:56px;
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0; position:relative; z-index:100;
        }
        .nav-logo { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:1px; color:var(--text); }
        .nav-logo span { color:var(--red); }
        .nav-right { display:flex; align-items:center; gap:12px; }
        .nav-user { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; }
        .nav-user span { color:var(--orange); }
        .nav-btn {
          padding:5px 14px; background:transparent; border:1px solid var(--border);
          color:var(--muted); border-radius:2px; font-family:'JetBrains Mono',monospace;
          font-size:11px; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:all 0.15s;
        }
        .nav-btn:hover { border-color:var(--red); color:var(--red); }
        .nav-btn.map { border-color:var(--orange); color:var(--orange); }
        .nav-btn.map:hover { background:var(--orange); color:#fff; }

        /* Main layout */
        .vd-main { flex:1; display:grid; grid-template-columns:280px 1fr; position:relative; z-index:1; }

        /* Sidebar */
        .sidebar {
          background:var(--card); border-right:1px solid var(--border);
          padding:28px 24px; display:flex; flex-direction:column; gap:24px;
        }

        .profile-section { }
        .profile-tag { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:3px; color:var(--muted); text-transform:uppercase; margin-bottom:8px; }
        .profile-name { font-family:'Bebas Neue',sans-serif; font-size:32px; letter-spacing:1px; color:var(--text); line-height:1; margin-bottom:4px; }
        .profile-role { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--orange); letter-spacing:1px; text-transform:uppercase; }

        .avail-toggle {
          display:flex; align-items:center; justify-content:space-between;
          background:var(--mid); border:1px solid var(--border); border-radius:4px; padding:12px 16px;
          cursor:pointer; transition:border-color 0.2s;
        }
        .avail-toggle:hover { border-color:var(--red); }
        .avail-label { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; }
        .avail-status { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center; gap:6px; }
        .avail-dot { width:8px; height:8px; border-radius:50%; }

        .skills-section { }
        .section-label { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:3px; color:var(--muted); text-transform:uppercase; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border); }
        .skills-wrap { display:flex; flex-wrap:wrap; gap:6px; }
        .skill-tag {
          padding:4px 10px; border-radius:2px;
          background:rgba(245,124,43,0.1); border:1px solid rgba(245,124,43,0.3);
          color:var(--orange); font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1px; text-transform:uppercase;
        }

        .stats-section { }
        .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .stat-card { background:var(--mid); border:1px solid var(--border); border-radius:4px; padding:14px; }
        .stat-val { font-family:'Bebas Neue',sans-serif; font-size:32px; color:var(--text); line-height:1; }
        .stat-lbl { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; margin-top:4px; }
        .stat-card.assigned .stat-val { color:var(--orange); }
        .stat-card.completed .stat-val { color:var(--green); }

        /* Content */
        .content { padding:28px 32px; overflow-y:auto; }

        .tabs { display:flex; gap:0; margin-bottom:24px; border-bottom:1px solid var(--border); }
        .tab {
          padding:10px 20px; background:transparent; border:none;
          font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:2px;
          text-transform:uppercase; color:var(--muted); cursor:pointer; transition:all 0.15s;
          border-bottom:2px solid transparent; margin-bottom:-1px;
        }
        .tab:hover { color:var(--text); }
        .tab.active { color:var(--red); border-bottom-color:var(--red); }

        .section-header { margin-bottom:20px; }
        .section-title { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:1px; color:var(--text); }
        .section-sub { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); letter-spacing:1px; margin-top:4px; }

        .sos-list { display:flex; flex-direction:column; gap:10px; }
        .sos-card {
          background:var(--card); border:1px solid var(--border); border-radius:4px;
          padding:18px 20px; transition:border-color 0.2s; animation:fadeIn 0.3s ease both;
          display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .sos-card:hover { border-color:#3a3a3a; }

        .sos-left { flex:1; }
        .sos-top { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .sos-type { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:1px; color:var(--text); }
        .sos-badge {
          padding:2px 8px; border-radius:2px;
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:1px; text-transform:uppercase;
        }
        .sos-desc { font-size:13px; color:var(--muted); line-height:1.5; margin-bottom:8px; }
        .sos-meta { font-family:'JetBrains Mono',monospace; font-size:10px; color:#3a3a3a; }

        .sos-actions { display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
        .action-btn {
          padding:7px 16px; border-radius:2px; border:none;
          font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1px;
          text-transform:uppercase; cursor:pointer; transition:all 0.15s; white-space:nowrap;
        }
        .action-btn.assign { background:var(--red); color:#fff; }
        .action-btn.assign:hover { background:#c41d15; }
        .action-btn.complete { background:rgba(46,204,113,0.15); border:1px solid rgba(46,204,113,0.3); color:var(--green); }
        .action-btn.complete:hover { background:rgba(46,204,113,0.25); }

        .empty-state {
          text-align:center; padding:60px 20px;
          font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--muted);
          letter-spacing:2px; text-transform:uppercase;
        }
        .empty-icon { font-size:40px; margin-bottom:16px; }

        .loading { text-align:center; padding:60px; font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--muted); letter-spacing:2px; }
      `}</style>

      <div className="vd-root">
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-logo">DISASTER<span>LINK</span></div>
          <div className="nav-right">
            <button className="nav-btn map" onClick={() => navigate('/map')}>← Live Map</button>
            <div className="nav-user"><span>{user.role?.toUpperCase()}</span> · {user.name}</div>
            <button className="nav-btn" onClick={logout}>Logout</button>
          </div>
        </nav>

        {loading ? (
          <div className="loading">Loading profile...</div>
        ) : (
          <div className="vd-main">
            {/* Sidebar */}
            <aside className="sidebar">
              <div className="profile-section">
                <div className="profile-tag">Volunteer Profile</div>
                <div className="profile-name">{user.name?.toUpperCase()}</div>
                <div className="profile-role">Field Volunteer</div>
              </div>

              {/* Availability toggle */}
              <div className="avail-toggle" onClick={toggleAvailability}>
                <div className="avail-label">Status</div>
                <div className="avail-status" style={{ color: availColor }}>
                  <div className="avail-dot" style={{ background: availColor }} />
                  {profile?.availability?.toUpperCase()}
                </div>
              </div>

              {/* Skills */}
              <div className="skills-section">
                <div className="section-label">Skills</div>
                <div className="skills-wrap">
                  {profile?.skills?.map(s => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="stats-section">
                <div className="section-label">Activity</div>
                <div className="stats-grid">
                  <div className="stat-card assigned">
                    <div className="stat-val">{profile?.assignedTasks?.length || 0}</div>
                    <div className="stat-lbl">Assigned</div>
                  </div>
                  <div className="stat-card completed">
                    <div className="stat-val">{profile?.completedTasks?.length || 0}</div>
                    <div className="stat-lbl">Completed</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="content">
              <div className="tabs">
                {['matches', 'assigned', 'completed'].map(tab => (
                  <button key={tab} className={`tab${activeTab === tab ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab)}>
                    {tab === 'matches' ? `Nearby Requests (${matches.length})` :
                     tab === 'assigned' ? `Assigned (${profile?.assignedTasks?.length || 0})` :
                     `Completed (${profile?.completedTasks?.length || 0})`}
                  </button>
                ))}
              </div>

              {/* Matches tab */}
              {activeTab === 'matches' && (
                <div>
                  <div className="section-header">
                    <div className="section-title">NEARBY SOS REQUESTS</div>
                    <div className="section-sub">Sorted by urgency · Click assign to take a task</div>
                  </div>
                  <div className="sos-list">
                    {matches.length === 0 ? (
                      <div className="empty-state">
                        No pending requests nearby
                      </div>
                    ) : matches.map((sos, i) => {
                      const u = urgencyConfig[sos.urgency] || urgencyConfig.low;
                      return (
                        <div key={sos._id} className="sos-card" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="sos-left">
                            <div className="sos-top">
                              <div className="sos-type">{sos.type?.toUpperCase()}</div>
                              <div className="sos-badge" style={{ background: u.bg, color: u.color, border: `1px solid ${u.border}` }}>
                                {sos.urgency}
                              </div>
                            </div>
                            <div className="sos-desc">{sos.description}</div>
                            <div className="sos-meta">
                              📍 {sos.location?.address} &nbsp;·&nbsp; By {sos.submittedBy?.name} &nbsp;·&nbsp; {sos.submittedBy?.phone}
                            </div>
                          </div>
                          <div className="sos-actions">
                            <button className="action-btn assign" onClick={() => assignTask(sos._id)}>
                              Assign →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assigned tab */}
              {activeTab === 'assigned' && (
                <div>
                  <div className="section-header">
                    <div className="section-title">ASSIGNED TASKS</div>
                    <div className="section-sub">Tasks currently assigned to you</div>
                  </div>
                  <div className="sos-list">
                    {!profile?.assignedTasks?.length ? (
                      <div className="empty-state">
                        No tasks assigned yet
                      </div>
                    ) : profile.assignedTasks.map((sos, i) => {
                      const u = urgencyConfig[sos.urgency] || urgencyConfig.low;
                      return (
                        <div key={sos._id} className="sos-card" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="sos-left">
                            <div className="sos-top">
                              <div className="sos-type">{sos.type?.toUpperCase()}</div>
                              <div className="sos-badge" style={{ background: u.bg, color: u.color, border: `1px solid ${u.border}` }}>
                                {sos.urgency}
                              </div>
                            </div>
                            <div className="sos-desc">{sos.description}</div>
                            <div className="sos-meta">📍 {sos.location?.address}</div>
                          </div>
                          <div className="sos-actions">
                            <button className="action-btn complete" onClick={() => completeTask(sos._id)}>
                              Mark Done ✓
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed tab */}
              {activeTab === 'completed' && (
                <div>
                  <div className="section-header">
                    <div className="section-title">COMPLETED TASKS</div>
                    <div className="section-sub">Tasks you have resolved</div>
                  </div>
                  <div className="sos-list">
                    {!profile?.completedTasks?.length ? (
                      <div className="empty-state">
                        <div className="empty-icon">🏆</div>
                        No completed tasks yet
                      </div>
                    ) : profile.completedTasks.map((sos, i) => (
                      <div key={sos._id} className="sos-card" style={{ animationDelay: `${i * 0.05}s`, borderColor: 'rgba(46,204,113,0.2)' }}>
                        <div className="sos-left">
                          <div className="sos-top">
                            <div className="sos-type">{sos.type?.toUpperCase()}</div>
                            <div className="sos-badge" style={{ background: 'rgba(46,204,113,0.1)', color: '#2ECC71', border: '1px solid rgba(46,204,113,0.3)' }}>
                              Resolved
                            </div>
                          </div>
                          <div className="sos-desc">{sos.description}</div>
                          <div className="sos-meta">📍 {sos.location?.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default VolunteerDashboard;