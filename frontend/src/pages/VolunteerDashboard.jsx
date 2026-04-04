import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const urgencyConfig = {
  critical: { color: '#E8231A', bg: 'rgba(232,35,26,0.1)', border: 'rgba(232,35,26,0.3)' },
  high:     { color: '#F57C2B', bg: 'rgba(245,124,43,0.1)', border: 'rgba(245,124,43,0.3)' },
  medium:   { color: '#F5C842', bg: 'rgba(245,200,66,0.1)', border: 'rgba(245,200,66,0.3)' },
  low:      { color: '#2ECC71', bg: 'rgba(46,204,113,0.1)', border: 'rgba(46,204,113,0.3)' },
};

const themes = {
  dark:  { bg:'#0D0D0D', mid:'#1A1A1A', card:'#141414', border:'#2A2A2A', text:'#E8E4DC', muted:'#7A7570', navBg:'#0D0D0D', sidebarBg:'#141414' },
  light: { bg:'#f5f3ee', mid:'#ffffff', card:'#ffffff', border:'#e2ddd5', text:'#1a1814', muted:'#8a8278', navBg:'#1a1814', sidebarBg:'#f0ede6' },
};

function VolunteerDashboard() {
  const [isDark, setIsDark] = useState(true);
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('matches');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const t = isDark ? themes.dark : themes.light;

  const fetchData = async () => {
    try {
      const [profileRes, matchesRes] = await Promise.all([
        API.get('/volunteer/me'),
        API.get('/volunteer/matches')
      ]);
      setProfile(profileRes.data);
      setMatches(matchesRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
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
    try { await API.patch(`/volunteer/assign/${sosId}`); fetchData(); }
    catch (err) { console.error(err); }
  };

  const completeTask = async (sosId) => {
    try { await API.patch(`/volunteer/complete/${sosId}`); fetchData(); }
    catch (err) { console.error(err); }
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };
  const availColor = profile?.availability === 'available' ? '#2ECC71' : profile?.availability === 'deployed' ? '#F57C2B' : '#7A7570';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .vd-root { min-height:100vh; background:${t.bg}; color:${t.text}; font-family:'DM Sans',sans-serif; display:flex; flex-direction:column; transition:background 0.3s,color 0.3s; }
        ${isDark ? `.vd-root::before { content:''; position:fixed; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events:none; z-index:999; opacity:0.4; }` : ''}

        .navbar { background:${t.navBg}; border-bottom:1px solid ${t.border}; padding:0 32px; height:56px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; position:relative; z-index:100; transition:background 0.3s; }
        .nav-logo { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:1px; color:#E8E4DC; }
        .nav-logo span { color:#E8231A; }
        .nav-right { display:flex; align-items:center; gap:12px; }
        .nav-user { font-family:'JetBrains Mono',monospace; font-size:11px; color:rgba(255,255,255,0.4); letter-spacing:1px; text-transform:uppercase; }
        .nav-user span { color:#F57C2B; }
        .nav-btn { padding:5px 14px; background:transparent; border:1px solid rgba(255,255,255,0.15); color:rgba(255,255,255,0.4); border-radius:2px; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:all 0.15s; }
        .nav-btn:hover { border-color:#E8231A; color:#E8231A; }
        .nav-btn.map { border-color:#F57C2B; color:#F57C2B; }
        .nav-btn.map:hover { background:#F57C2B; color:#fff; }

        .theme-toggle { display:flex; align-items:center; gap:8px; background:${isDark?'#1A1A1A':'rgba(255,255,255,0.1)'}; border:1px solid ${isDark?'#2A2A2A':'rgba(255,255,255,0.2)'}; border-radius:20px; padding:4px 12px; cursor:pointer; transition:all 0.2s; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1px; color:rgba(255,255,255,0.4); text-transform:uppercase; }
        .theme-toggle:hover { border-color:#E8231A; }
        .toggle-track { width:32px; height:18px; border-radius:9px; background:${isDark?'#2A2A2A':'#E8231A'}; position:relative; transition:background 0.3s; flex-shrink:0; }
        .toggle-thumb { width:12px; height:12px; border-radius:50%; background:${isDark?'#7A7570':'#fff'}; position:absolute; top:3px; left:${isDark?'3px':'17px'}; transition:left 0.3s,background 0.3s; }

        .vd-main { flex:1; display:grid; grid-template-columns:280px 1fr; position:relative; z-index:1; }

        .sidebar { background:${t.sidebarBg}; border-right:1px solid ${t.border}; padding:28px 24px; display:flex; flex-direction:column; gap:24px; transition:background 0.3s; }
        .profile-tag { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:3px; color:${t.muted}; text-transform:uppercase; margin-bottom:8px; }
        .profile-name { font-family:'Bebas Neue',sans-serif; font-size:32px; letter-spacing:1px; color:${t.text}; line-height:1; margin-bottom:4px; }
        .profile-role { font-family:'JetBrains Mono',monospace; font-size:11px; color:#F57C2B; letter-spacing:1px; text-transform:uppercase; }

        .avail-toggle { display:flex; align-items:center; justify-content:space-between; background:${t.mid}; border:1px solid ${t.border}; border-radius:4px; padding:12px 16px; cursor:pointer; transition:border-color 0.2s; }
        .avail-toggle:hover { border-color:#E8231A; }
        .avail-label { font-family:'JetBrains Mono',monospace; font-size:11px; color:${t.muted}; letter-spacing:1px; text-transform:uppercase; }
        .avail-status { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center; gap:6px; }
        .avail-dot { width:8px; height:8px; border-radius:50%; }

        .section-label { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:3px; color:${t.muted}; text-transform:uppercase; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid ${t.border}; }
        .skills-wrap { display:flex; flex-wrap:wrap; gap:6px; }
        .skill-tag { padding:4px 10px; border-radius:2px; background:rgba(245,124,43,0.1); border:1px solid rgba(245,124,43,0.3); color:#F57C2B; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1px; text-transform:uppercase; }

        .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .stat-card { background:${t.mid}; border:1px solid ${t.border}; border-radius:4px; padding:14px; }
        .stat-val { font-family:'Bebas Neue',sans-serif; font-size:32px; color:${t.text}; line-height:1; }
        .stat-lbl { font-family:'JetBrains Mono',monospace; font-size:10px; color:${t.muted}; letter-spacing:1px; text-transform:uppercase; margin-top:4px; }
        .stat-card.assigned .stat-val { color:#F57C2B; }
        .stat-card.completed .stat-val { color:#2ECC71; }

        .content { padding:28px 32px; overflow-y:auto; }
        .tabs { display:flex; gap:0; margin-bottom:24px; border-bottom:1px solid ${t.border}; }
        .tab { padding:10px 20px; background:transparent; border:none; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:${t.muted}; cursor:pointer; transition:all 0.15s; border-bottom:2px solid transparent; margin-bottom:-1px; }
        .tab:hover { color:${t.text}; }
        .tab.active { color:#E8231A; border-bottom-color:#E8231A; }

        .section-title { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:1px; color:${t.text}; }
        .section-sub { font-family:'JetBrains Mono',monospace; font-size:11px; color:${t.muted}; letter-spacing:1px; margin-top:4px; margin-bottom:20px; }

        .sos-list { display:flex; flex-direction:column; gap:10px; }
        .sos-card { background:${t.card}; border:1px solid ${t.border}; border-radius:4px; padding:18px 20px; transition:border-color 0.2s; animation:fadeIn 0.3s ease both; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
        .sos-card:hover { border-color:${isDark?'#3a3a3a':'#c5bfb7'}; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .sos-type { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:1px; color:${t.text}; }
        .sos-badge { padding:2px 8px; border-radius:2px; font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:1px; text-transform:uppercase; }
        .sos-desc { font-size:13px; color:${t.muted}; line-height:1.5; margin:8px 0; }
        .sos-meta { font-family:'JetBrains Mono',monospace; font-size:10px; color:${isDark?'#3a3a3a':'#c5bfb7'}; }

        .sos-actions { display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
        .action-btn { padding:7px 16px; border-radius:2px; border:none; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
        .action-btn.assign { background:#E8231A; color:#fff; }
        .action-btn.assign:hover { background:#c41d15; }
        .action-btn.complete { background:rgba(46,204,113,0.15); border:1px solid rgba(46,204,113,0.3); color:#2ECC71; }
        .action-btn.complete:hover { background:rgba(46,204,113,0.25); }

        .empty-state { text-align:center; padding:60px 20px; font-family:'JetBrains Mono',monospace; font-size:12px; color:${t.muted}; letter-spacing:2px; text-transform:uppercase; }
        .empty-icon { font-size:36px; margin-bottom:16px; }
        .loading { text-align:center; padding:60px; font-family:'JetBrains Mono',monospace; font-size:12px; color:${t.muted}; letter-spacing:2px; }
      `}</style>

      <div className="vd-root">
        <nav className="navbar">
          <div className="nav-logo">DISASTER<span>LINK</span></div>
          <div className="nav-right">
            <button className="nav-btn map" onClick={() => navigate('/map')}>← Live Map</button>
            <div className="nav-user"><span>{user.role?.toUpperCase()}</span> · {user.name}</div>
            <div className="theme-toggle" onClick={() => setIsDark(!isDark)}>
              {isDark ? '☀️' : '🌙'}
              <div className="toggle-track"><div className="toggle-thumb" /></div>
              {isDark ? 'LIGHT' : 'DARK'}
            </div>
            <button className="nav-btn" onClick={logout}>Logout</button>
          </div>
        </nav>

        {loading ? <div className="loading">Loading profile...</div> : (
          <div className="vd-main">
            <aside className="sidebar">
              <div>
                <div className="profile-tag">Volunteer Profile</div>
                <div className="profile-name">{user.name?.toUpperCase()}</div>
                <div className="profile-role">Field Volunteer</div>
              </div>
              <div className="avail-toggle" onClick={toggleAvailability}>
                <div className="avail-label">Status</div>
                <div className="avail-status" style={{ color: availColor }}>
                  <div className="avail-dot" style={{ background: availColor }} />
                  {profile?.availability?.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="section-label">Skills</div>
                <div className="skills-wrap">
                  {profile?.skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>
              <div>
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

            <div className="content">
              <div className="tabs">
                {['matches','assigned','completed'].map(tab => (
                  <button key={tab} className={`tab${activeTab===tab?' active':''}`} onClick={() => setActiveTab(tab)}>
                    {tab==='matches'?`Nearby Requests (${matches.length})`:tab==='assigned'?`Assigned (${profile?.assignedTasks?.length||0})`:`Completed (${profile?.completedTasks?.length||0})`}
                  </button>
                ))}
              </div>

              {activeTab === 'matches' && (
                <div>
                  <div className="section-title">NEARBY SOS REQUESTS</div>
                  <div className="section-sub">Sorted by urgency · Click assign to take a task</div>
                  <div className="sos-list">
                    {matches.length === 0 ? (
                      <div className="empty-state"><div className="empty-icon">🎯</div>No pending requests nearby</div>
                    ) : matches.map((sos, i) => {
                      const u = urgencyConfig[sos.urgency] || urgencyConfig.low;
                      return (
                        <div key={sos._id} className="sos-card" style={{ animationDelay:`${i*0.05}s` }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                              <div className="sos-type">{sos.type?.toUpperCase()}</div>
                              <div className="sos-badge" style={{ background:u.bg, color:u.color, border:`1px solid ${u.border}` }}>{sos.urgency}</div>
                            </div>
                            <div className="sos-desc">{sos.description}</div>
                            <div className="sos-meta">📍 {sos.location?.address} · By {sos.submittedBy?.name} · {sos.submittedBy?.phone}</div>
                          </div>
                          <div className="sos-actions">
                            <button className="action-btn assign" onClick={() => assignTask(sos._id)}>Assign →</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'assigned' && (
                <div>
                  <div className="section-title">ASSIGNED TASKS</div>
                  <div className="section-sub">Tasks currently assigned to you</div>
                  <div className="sos-list">
                    {!profile?.assignedTasks?.length ? (
                      <div className="empty-state"><div className="empty-icon">📋</div>No tasks assigned yet</div>
                    ) : profile.assignedTasks.map((sos, i) => {
                      const u = urgencyConfig[sos.urgency] || urgencyConfig.low;
                      return (
                        <div key={sos._id} className="sos-card" style={{ animationDelay:`${i*0.05}s` }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                              <div className="sos-type">{sos.type?.toUpperCase()}</div>
                              <div className="sos-badge" style={{ background:u.bg, color:u.color, border:`1px solid ${u.border}` }}>{sos.urgency}</div>
                            </div>
                            <div className="sos-desc">{sos.description}</div>
                            <div className="sos-meta">📍 {sos.location?.address}</div>
                          </div>
                          <div className="sos-actions">
                            <button className="action-btn complete" onClick={() => completeTask(sos._id)}>Mark Done ✓</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'completed' && (
                <div>
                  <div className="section-title">COMPLETED TASKS</div>
                  <div className="section-sub">Tasks you have resolved</div>
                  <div className="sos-list">
                    {!profile?.completedTasks?.length ? (
                      <div className="empty-state"><div className="empty-icon">🏆</div>No completed tasks yet</div>
                    ) : profile.completedTasks.map((sos, i) => (
                      <div key={sos._id} className="sos-card" style={{ animationDelay:`${i*0.05}s`, borderColor:'rgba(46,204,113,0.2)' }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                            <div className="sos-type">{sos.type?.toUpperCase()}</div>
                            <div className="sos-badge" style={{ background:'rgba(46,204,113,0.1)', color:'#2ECC71', border:'1px solid rgba(46,204,113,0.3)' }}>Resolved</div>
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