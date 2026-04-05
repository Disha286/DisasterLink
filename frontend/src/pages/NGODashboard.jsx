import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Chat from '../components/Chat';
import useSocketNotifications from '../hooks/useSocketNotifications';

const urgencyConfig = {
  critical: { color: '#E8231A', bg: 'rgba(232,35,26,0.1)', border: 'rgba(232,35,26,0.3)' },
  high:     { color: '#F57C2B', bg: 'rgba(245,124,43,0.1)', border: 'rgba(245,124,43,0.3)' },
  medium:   { color: '#F5C842', bg: 'rgba(245,200,66,0.1)', border: 'rgba(245,200,66,0.3)' },
  low:      { color: '#2ECC71', bg: 'rgba(46,204,113,0.1)', border: 'rgba(46,204,113,0.3)' },
};

const categoryIcons = { food: '🍱', water: '💧', medical: '💊', vehicle: '🚗', shelter: '🏕️', other: '📦' };

const themes = {
  dark:  { bg:'#0D0D0D', mid:'#1A1A1A', card:'#141414', border:'#2A2A2A', text:'#E8E4DC', muted:'#7A7570', navBg:'#0D0D0D', sidebarBg:'#141414' },
  light: { bg:'#f5f3ee', mid:'#ffffff', card:'#ffffff', border:'#e2ddd5', text:'#1a1814', muted:'#8a8278', navBg:'#1a1814', sidebarBg:'#f0ede6' },
};

function NGODashboard() {
  const [isDark, setIsDark] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [sosList, setSosList] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [resources, setResources] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [resForm, setResForm] = useState({ name:'', category:'food', quantity:'', unit:'units', lowStockThreshold:'10', zone:'' });
  const [editingRes, setEditingRes] = useState(null);
  const [broadForm, setBroadForm] = useState({ title:'', message:'', zone:'', type:'info' });
  const [broadSuccess, setBroadSuccess] = useState('');
  useSocketNotifications();

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const t = isDark ? themes.dark : themes.light;

  const fetchAll = async () => {
    try {
      const [dashRes, sosRes, volRes, resRes, broadRes] = await Promise.all([
        API.get('/ngo/dashboard'), API.get('/ngo/sos'),
        API.get('/ngo/volunteers'), API.get('/ngo/resources'), API.get('/ngo/broadcasts'),
      ]);
      setDashboard(dashRes.data); setSosList(sosRes.data);
      setVolunteers(volRes.data); setResources(resRes.data); setBroadcasts(broadRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const addResource = async (e) => {
    e.preventDefault();
    try {
      await API.post('/ngo/resources', { ...resForm, quantity: Number(resForm.quantity), lowStockThreshold: Number(resForm.lowStockThreshold) });
      setResForm({ name:'', category:'food', quantity:'', unit:'units', lowStockThreshold:'10', zone:'' });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const updateQuantity = async (id, quantity) => {
    try { await API.patch(`/ngo/resources/${id}`, { quantity: Number(quantity) }); fetchAll(); }
    catch (err) { console.error(err); }
  };

  const deleteResource = async (id) => {
    try { await API.delete(`/ngo/resources/${id}`); fetchAll(); }
    catch (err) { console.error(err); }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    try {
      await API.post('/ngo/broadcast', broadForm);
      setBroadSuccess('Broadcast sent successfully!');
      setBroadForm({ title:'', message:'', zone:'', type:'info' });
      fetchAll();
      setTimeout(() => setBroadSuccess(''), 3000);
    } catch (err) { console.error(err); }
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };
  const statusColor = (s) => s === 'available' ? '#2ECC71' : s === 'low' ? '#F57C2B' : '#E8231A';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        :root { --red:#E8231A; --orange:#F57C2B; --yellow:#F5C842; --green:#2ECC71; }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .ngo-root { min-height:100vh; background:${t.bg}; color:${t.text}; font-family:'DM Sans',sans-serif; display:flex; flex-direction:column; overflow-x:hidden; transition:background 0.3s,color 0.3s; }
        ${isDark ? `.ngo-root::before { content:''; position:fixed; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events:none; z-index:999; opacity:0.4; }` : ''}

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

        .theme-toggle { display:flex; align-items:center; gap:8px; background:${isDark ? '#1A1A1A' : 'rgba(255,255,255,0.1)'}; border:1px solid ${isDark ? '#2A2A2A' : 'rgba(255,255,255,0.2)'}; border-radius:20px; padding:4px 12px; cursor:pointer; transition:all 0.2s; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1px; color:rgba(255,255,255,0.4); text-transform:uppercase; }
        .theme-toggle:hover { border-color:#E8231A; }
        .toggle-track { width:32px; height:18px; border-radius:9px; background:${isDark ? '#2A2A2A' : '#E8231A'}; position:relative; transition:background 0.3s; flex-shrink:0; }
        .toggle-thumb { width:12px; height:12px; border-radius:50%; background:${isDark ? '#7A7570' : '#fff'}; position:absolute; top:3px; left:${isDark ? '3px' : '17px'}; transition:left 0.3s,background 0.3s; }

        .main-layout { flex:1; display:grid; grid-template-columns:220px 1fr; position:relative; z-index:1; }

        .sidebar { background:${t.sidebarBg}; border-right:1px solid ${t.border}; padding:24px 0; display:flex; flex-direction:column; transition:background 0.3s; }
        .sidebar-label { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:3px; color:${t.muted}; text-transform:uppercase; padding:0 20px; margin-bottom:8px; margin-top:20px; }
        .sidebar-label:first-child { margin-top:0; }
        .sidebar-item { display:flex; align-items:center; gap:10px; padding:10px 20px; cursor:pointer; transition:all 0.15s; font-size:13px; color:${t.muted}; border-left:2px solid transparent; }
        .sidebar-item:hover { color:${t.text}; background:${isDark ? '#1A1A1A' : '#e8e5de'}; }
        .sidebar-item.active { color:#E8231A; border-left-color:#E8231A; background:rgba(232,35,26,0.05); }
        .sidebar-icon { font-size:16px; }

        .content { padding:28px 32px; overflow-y:auto; max-height:calc(100vh - 56px); }

        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:28px; }
        .stat-card { background:${t.card}; border:1px solid ${t.border}; border-radius:4px; padding:20px; position:relative; overflow:hidden; transition:background 0.3s; }
        .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; }
        .stat-card.red::before { background:#E8231A; }
        .stat-card.orange::before { background:#F57C2B; }
        .stat-card.green::before { background:#2ECC71; }
        .stat-card.yellow::before { background:#F5C842; }
        .stat-val { font-family:'Bebas Neue',sans-serif; font-size:40px; line-height:1; color:${t.text}; }
        .stat-lbl { font-family:'JetBrains Mono',monospace; font-size:10px; color:${t.muted}; letter-spacing:2px; text-transform:uppercase; margin-top:6px; }

        .section-title { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:1px; color:${t.text}; margin-bottom:4px; }
        .section-sub { font-family:'JetBrains Mono',monospace; font-size:11px; color:${t.muted}; letter-spacing:1px; margin-bottom:20px; }

        .data-table { width:100%; border-collapse:collapse; }
        .data-table th { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:2px; color:${t.muted}; text-transform:uppercase; padding:10px 14px; text-align:left; border-bottom:1px solid ${t.border}; }
        .data-table td { padding:12px 14px; border-bottom:1px solid ${t.border}; font-size:13px; vertical-align:middle; color:${t.text}; }
        .data-table tr:hover td { background:${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}; }

        .badge { display:inline-block; padding:2px 8px; border-radius:2px; font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:1px; text-transform:uppercase; }

        .form-card { background:${t.card}; border:1px solid ${t.border}; border-radius:4px; padding:24px; margin-bottom:24px; transition:background 0.3s; }
        .form-title { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:1px; color:${t.text}; margin-bottom:16px; }
        .form-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:12px; }
        .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .dl-label { display:block; font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:1px; color:${t.muted}; text-transform:uppercase; margin-bottom:6px; }
        .dl-input { width:100%; padding:10px 12px; background:${t.mid}; border:1px solid ${t.border}; border-radius:4px; font-size:13px; font-family:'DM Sans',sans-serif; color:${t.text}; outline:none; transition:border-color 0.2s; }
        .dl-input:focus { border-color:#E8231A; }
        .dl-input::placeholder { color:${isDark ? '#3a3a3a' : '#c5bfb7'}; }
        .dl-select { width:100%; padding:10px 12px; background:${t.mid}; border:1px solid ${t.border}; border-radius:4px; font-size:13px; font-family:'DM Sans',sans-serif; color:${t.text}; outline:none; }

        .btn { padding:9px 18px; border-radius:2px; border:none; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:all 0.15s; }
        .btn-red { background:#E8231A; color:#fff; }
        .btn-red:hover { background:#c41d15; }
        .btn-outline { background:transparent; border:1px solid ${t.border}; color:${t.muted}; }
        .btn-outline:hover { border-color:#E8231A; color:#E8231A; }
        .btn-sm { padding:5px 10px; font-size:10px; }

        .low-stock-banner { background:rgba(232,35,26,0.08); border:1px solid rgba(232,35,26,0.2); border-radius:4px; padding:12px 16px; margin-bottom:20px; display:flex; align-items:center; gap:10px; font-family:'JetBrains Mono',monospace; font-size:12px; color:#E8231A; }

        .broadcast-list { display:flex; flex-direction:column; gap:10px; margin-top:20px; }
        .broadcast-card { background:${t.card}; border:1px solid ${t.border}; border-radius:4px; padding:16px 20px; transition:background 0.3s; }
        .broadcast-header { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
        .broadcast-title { font-family:'Bebas Neue',sans-serif; font-size:18px; color:${t.text}; }
        .broadcast-meta { font-family:'JetBrains Mono',monospace; font-size:10px; color:${t.muted}; }
        .broadcast-msg { font-size:13px; color:${t.muted}; margin-top:4px; }

        .success-msg { background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); color:#2ECC71; padding:10px 14px; border-radius:4px; font-family:'JetBrains Mono',monospace; font-size:12px; margin-bottom:16px; }
        .empty-state { text-align:center; padding:40px 20px; font-family:'JetBrains Mono',monospace; font-size:11px; color:${t.muted}; letter-spacing:2px; text-transform:uppercase; }
        .qty-input { width:80px; padding:5px 8px; background:${t.mid}; border:1px solid ${t.border}; border-radius:2px; font-size:12px; color:${t.text}; outline:none; font-family:'JetBrains Mono',monospace; }

        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .fade-in { animation:fadeIn 0.3s ease both; }
      `}</style>

      <div className="ngo-root">
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

        <div className="main-layout">
          <aside className="sidebar">
            <div className="sidebar-label">Navigation</div>
            {[
              { key:'overview', icon:'📊', label:'Overview' },
              { key:'sos', icon:'🆘', label:'SOS Requests' },
              { key:'volunteers', icon:'🤝', label:'Volunteers' },
              { key:'resources', icon:'📦', label:'Resources' },
              { key:'broadcast', icon:'📢', label:'Broadcast' },
            ].map(item => (
              <div key={item.key} className={`sidebar-item${activeTab === item.key ? ' active' : ''}`}
                onClick={() => setActiveTab(item.key)}>
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </aside>

          <div className="content">
            {loading ? <div className="empty-state">Loading dashboard...</div> : (
              <>
                {activeTab === 'overview' && (
                  <div className="fade-in">
                    <div className="section-title">NGO DASHBOARD</div>
                    <div className="section-sub">Real-time overview of all relief operations</div>
                    <div className="stats-grid">
                      <div className="stat-card red"><div className="stat-val">{dashboard?.totalSOS||0}</div><div className="stat-lbl">Total SOS</div></div>
                      <div className="stat-card orange"><div className="stat-val">{dashboard?.pendingSOS||0}</div><div className="stat-lbl">Pending</div></div>
                      <div className="stat-card green"><div className="stat-val">{dashboard?.resolvedSOS||0}</div><div className="stat-lbl">Resolved</div></div>
                      <div className="stat-card yellow"><div className="stat-val">{dashboard?.totalVolunteers||0}</div><div className="stat-lbl">Volunteers</div></div>
                    </div>
                    {dashboard?.lowStock?.length > 0 && (
                      <div className="low-stock-banner">⚠ {dashboard.lowStock.length} resource(s) running low: {dashboard.lowStock.map(r=>r.name).join(', ')}</div>
                    )}
                    <div className="section-title" style={{fontSize:20,marginBottom:12}}>RECENT SOS REQUESTS</div>
                    <table className="data-table">
                      <thead><tr><th>Type</th><th>Urgency</th><th>Location</th><th>By</th><th>Status</th></tr></thead>
                      <tbody>
                        {sosList.slice(0,5).map(sos => {
                          const u = urgencyConfig[sos.urgency]||urgencyConfig.low;
                          return (
                            <tr key={sos._id}>
                              <td style={{fontFamily:'Bebas Neue,sans-serif',fontSize:16,letterSpacing:1}}>{sos.type?.toUpperCase()}</td>
                              <td><span className="badge" style={{background:u.bg,color:u.color,border:`1px solid ${u.border}`}}>{sos.urgency}</span></td>
                              <td style={{color:t.muted,fontSize:12}}>{sos.location?.address}</td>
                              <td style={{color:t.muted,fontSize:12}}>{sos.submittedBy?.name}</td>
                              <td><span className="badge" style={{background:'rgba(255,255,255,0.05)',color:t.muted,border:`1px solid ${t.border}`}}>{sos.status}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'sos' && (
                  <div className="fade-in">
                    <div className="section-title">ALL SOS REQUESTS</div>
                    <div className="section-sub">{sosList.length} total requests</div>
                    <table className="data-table">
                      <thead><tr><th>Type</th><th>Urgency</th><th>Description</th><th>Location</th><th>By</th><th>Assigned</th><th>Status</th></tr></thead>
                      <tbody>
                        {sosList.map(sos => {
                          const u = urgencyConfig[sos.urgency]||urgencyConfig.low;
                          return (
                            <tr key={sos._id}>
                              <td style={{fontFamily:'Bebas Neue,sans-serif',fontSize:16,letterSpacing:1}}>{sos.type?.toUpperCase()}</td>
                              <td><span className="badge" style={{background:u.bg,color:u.color,border:`1px solid ${u.border}`}}>{sos.urgency}</span></td>
                              <td style={{color:t.muted,fontSize:12,maxWidth:180}}>{sos.description}</td>
                              <td style={{color:t.muted,fontSize:12}}>{sos.location?.address}</td>
                              <td style={{color:t.muted,fontSize:12}}>{sos.submittedBy?.name}</td>
                              <td style={{color:t.muted,fontSize:12}}>{sos.assignedTo?.name||'—'}</td>
                              <td><span className="badge" style={{background:'rgba(255,255,255,0.05)',color:t.muted,border:`1px solid ${t.border}`}}>{sos.status}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'volunteers' && (
                  <div className="fade-in">
                    <div className="section-title">ALL VOLUNTEERS</div>
                    <div className="section-sub">{volunteers.length} registered volunteers</div>
                    <table className="data-table">
                      <thead><tr><th>Name</th><th>Skills</th><th>Location</th><th>Status</th><th>Assigned</th><th>Completed</th></tr></thead>
                      <tbody>
                        {volunteers.map(v => (
                          <tr key={v._id}>
                            <td><div style={{fontWeight:600}}>{v.user?.name}</div><div style={{fontSize:11,color:t.muted,fontFamily:'JetBrains Mono,monospace'}}>{v.user?.email}</div></td>
                            <td><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{v.skills?.map(s=><span key={s} className="badge" style={{background:'rgba(245,124,43,0.1)',color:'#F57C2B',border:'1px solid rgba(245,124,43,0.3)'}}>{s}</span>)}</div></td>
                            <td style={{color:t.muted,fontSize:12}}>{v.user?.location||'—'}</td>
                            <td><span className="badge" style={{background:v.availability==='available'?'rgba(46,204,113,0.1)':'rgba(245,124,43,0.1)',color:v.availability==='available'?'#2ECC71':'#F57C2B',border:`1px solid ${v.availability==='available'?'rgba(46,204,113,0.3)':'rgba(245,124,43,0.3)'}`}}>{v.availability}</span></td>
                            <td style={{fontFamily:'Bebas Neue,sans-serif',fontSize:20,color:'#F57C2B'}}>{v.assignedTasks?.length||0}</td>
                            <td style={{fontFamily:'Bebas Neue,sans-serif',fontSize:20,color:'#2ECC71'}}>{v.completedTasks?.length||0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="fade-in">
                    <div className="form-card">
                      <div className="form-title">ADD RESOURCE</div>
                      <form onSubmit={addResource}>
                        <div className="form-grid">
                          <div><label className="dl-label">Name</label><input className="dl-input" placeholder="e.g. Food Packets" value={resForm.name} onChange={e=>setResForm({...resForm,name:e.target.value})} required /></div>
                          <div><label className="dl-label">Category</label><select className="dl-select" value={resForm.category} onChange={e=>setResForm({...resForm,category:e.target.value})}>{['food','water','medical','vehicle','shelter','other'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                          <div><label className="dl-label">Zone</label><input className="dl-input" placeholder="e.g. North Bengaluru" value={resForm.zone} onChange={e=>setResForm({...resForm,zone:e.target.value})} /></div>
                        </div>
                        <div className="form-grid">
                          <div><label className="dl-label">Quantity</label><input className="dl-input" type="number" placeholder="500" value={resForm.quantity} onChange={e=>setResForm({...resForm,quantity:e.target.value})} required /></div>
                          <div><label className="dl-label">Unit</label><input className="dl-input" placeholder="packets / litres" value={resForm.unit} onChange={e=>setResForm({...resForm,unit:e.target.value})} /></div>
                          <div><label className="dl-label">Low Stock Threshold</label><input className="dl-input" type="number" placeholder="50" value={resForm.lowStockThreshold} onChange={e=>setResForm({...resForm,lowStockThreshold:e.target.value})} /></div>
                        </div>
                        <button className="btn btn-red" type="submit">Add Resource →</button>
                      </form>
                    </div>
                    <div className="section-title">INVENTORY</div>
                    <div className="section-sub">{resources.length} resources tracked</div>
                    <table className="data-table">
                      <thead><tr><th>Resource</th><th>Category</th><th>Quantity</th><th>Zone</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {resources.map(r => (
                          <tr key={r._id}>
                            <td style={{fontWeight:600}}>{categoryIcons[r.category]} {r.name}</td>
                            <td><span className="badge" style={{background:'rgba(255,255,255,0.05)',color:t.muted,border:`1px solid ${t.border}`}}>{r.category}</span></td>
                            <td>
                              {editingRes===r._id ? (
                                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                                  <input className="qty-input" type="number" defaultValue={r.quantity} onBlur={e=>{updateQuantity(r._id,e.target.value);setEditingRes(null);}} autoFocus />
                                  <span style={{fontSize:11,color:t.muted}}>{r.unit}</span>
                                </div>
                              ) : (
                                <span onClick={()=>setEditingRes(r._id)} style={{cursor:'pointer',fontFamily:'Bebas Neue,sans-serif',fontSize:20,color:statusColor(r.status)}}>
                                  {r.quantity} <span style={{fontSize:11,fontFamily:'DM Sans,sans-serif',color:t.muted}}>{r.unit}</span>
                                </span>
                              )}
                            </td>
                            <td style={{color:t.muted,fontSize:12}}>{r.zone||'—'}</td>
                            <td><span className="badge" style={{background:r.status==='available'?'rgba(46,204,113,0.1)':r.status==='low'?'rgba(245,124,43,0.1)':'rgba(232,35,26,0.1)',color:statusColor(r.status),border:`1px solid ${statusColor(r.status)}44`}}>{r.status}</span></td>
                            <td><button className="btn btn-outline btn-sm" onClick={()=>deleteResource(r._id)}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'broadcast' && (
                  <div className="fade-in">
                    <div className="section-title">BROADCAST ALERT</div>
                    <div className="section-sub">Send mass alerts to a zone</div>
                    {broadSuccess && <div className="success-msg">✓ {broadSuccess}</div>}
                    <div className="form-card">
                      <form onSubmit={sendBroadcast}>
                        <div className="form-grid-2">
                          <div><label className="dl-label">Title</label><input className="dl-input" placeholder="e.g. Evacuation Notice" value={broadForm.title} onChange={e=>setBroadForm({...broadForm,title:e.target.value})} required /></div>
                          <div><label className="dl-label">Zone</label><input className="dl-input" placeholder="e.g. North Bengaluru" value={broadForm.zone} onChange={e=>setBroadForm({...broadForm,zone:e.target.value})} required /></div>
                        </div>
                        <div style={{marginBottom:12}}><label className="dl-label">Type</label><select className="dl-select" value={broadForm.type} onChange={e=>setBroadForm({...broadForm,type:e.target.value})}>{['alert','info','warning','evacuation'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div style={{marginBottom:16}}><label className="dl-label">Message</label><textarea className="dl-input" rows={4} placeholder="Type your broadcast message here..." value={broadForm.message} onChange={e=>setBroadForm({...broadForm,message:e.target.value})} required style={{resize:'vertical'}} /></div>
                        <button className="btn btn-red" type="submit">Send Broadcast →</button>
                      </form>
                    </div>
                    <div className="section-title" style={{fontSize:20}}>BROADCAST HISTORY</div>
                    <div className="broadcast-list">
                      {broadcasts.length===0 ? <div className="empty-state">No broadcasts sent yet</div> : broadcasts.map(b => {
                        const typeColor = {alert:'#E8231A',info:'#3a8fd4',warning:'#F57C2B',evacuation:'#F5C842'};
                        return (
                          <div key={b._id} className="broadcast-card">
                            <div className="broadcast-header">
                              <div className="broadcast-title">{b.title}</div>
                              <span className="badge" style={{background:'rgba(255,255,255,0.05)',color:typeColor[b.type]||t.muted,border:`1px solid ${t.border}`}}>{b.type}</span>
                              <span className="badge" style={{background:'rgba(255,255,255,0.05)',color:t.muted,border:`1px solid ${t.border}`}}>📍 {b.zone}</span>
                            </div>
                            <div className="broadcast-msg">{b.message}</div>
                            <div className="broadcast-meta" style={{marginTop:8}}>Sent by {b.sentBy?.name} · {new Date(b.createdAt).toLocaleString()}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Chat room="general" />
      </div>
    </>
  );
}

export default NGODashboard;