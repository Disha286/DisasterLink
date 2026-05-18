import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import API from '../api/axios';
import useSocketNotifications from '../hooks/useSocketNotifications';
import Chat from '../components/Chat';

const COLORS = ['#E8231A', '#F57C2B', '#F5C842', '#2ECC71', '#3a8fd4', '#9b59b6'];

const themes = {
  dark:  { bg:'#0D0D0D', mid:'#1A1A1A', card:'#141414', border:'#2A2A2A', text:'#E8E4DC', muted:'#7A7570', navBg:'#0D0D0D', gridColor:'#2A2A2A', tooltipBg:'#1A1A1A' },
  light: { bg:'#f5f3ee', mid:'#ffffff', card:'#ffffff', border:'#e2ddd5', text:'#1a1814', muted:'#8a8278', navBg:'#1a1814', gridColor:'#e2ddd5', tooltipBg:'#ffffff' },
};

function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const t = isDark ? themes.dark : themes.light;

  useSocketNotifications();

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/analytics');
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0D0D0D', scale: 1.5 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('DisasterLink-Analytics-Report.pdf');
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  const statusChartData = data ? [
    { name: 'Pending', value: data.sosByStatus.pending, color: '#E8231A' },
    { name: 'Assigned', value: data.sosByStatus.assigned, color: '#F57C2B' },
    { name: 'Resolved', value: data.sosByStatus.resolved, color: '#2ECC71' },
  ] : [];

  const urgencyChartData = data ? [
    { name: 'Critical', value: data.sosByUrgency.critical, color: '#E8231A' },
    { name: 'High', value: data.sosByUrgency.high, color: '#F57C2B' },
    { name: 'Medium', value: data.sosByUrgency.medium, color: '#F5C842' },
    { name: 'Low', value: data.sosByUrgency.low, color: '#2ECC71' },
  ] : [];

  const volunteerChartData = data ? [
    { name: 'Available', value: data.volunteerStats.available, color: '#2ECC71' },
    { name: 'Deployed', value: data.volunteerStats.deployed, color: '#F57C2B' },
    { name: 'Offline', value: data.volunteerStats.offline, color: '#7A7570' },
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: t.tooltipBg, border: `1px solid ${t.border}`, padding: '10px 14px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
          <div style={{ color: t.muted, marginBottom: 4 }}>{label}</div>
          {payload.map((p, i) => (
            <div key={i} style={{ color: p.color || '#E8231A' }}>{p.name}: {p.value}</div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .an-root { min-height:100vh; background:${t.bg}; color:${t.text}; font-family:'DM Sans',sans-serif; display:flex; flex-direction:column; transition:background 0.3s; overflow-x:auto; }
        ${isDark ? `.an-root::before { content:''; position:fixed; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events:none; z-index:999; opacity:0.4; }` : ''}

        .navbar { background:${t.navBg}; border-bottom:1px solid ${t.border}; padding:0 32px; height:56px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; position:relative; z-index:100; }
        .nav-logo { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:1px; color:#E8E4DC; }
        .nav-logo span { color:#E8231A; }
        .nav-right { display:flex; align-items:center; gap:12px; }
        .nav-user { font-family:'JetBrains Mono',monospace; font-size:11px; color:rgba(255,255,255,0.4); letter-spacing:1px; text-transform:uppercase; }
        .nav-user span { color:#F57C2B; }
        .nav-btn { padding:5px 14px; background:transparent; border:1px solid rgba(255,255,255,0.15); color:rgba(255,255,255,0.4); border-radius:2px; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:all 0.15s; }
        .nav-btn:hover { border-color:#E8231A; color:#E8231A; }
        .nav-btn.map { border-color:#F57C2B; color:#F57C2B; }
        .nav-btn.map:hover { background:#F57C2B; color:#fff; }
        .nav-btn.export { border-color:#2ECC71; color:#2ECC71; }
        .nav-btn.export:hover { background:#2ECC71; color:#0D0D0D; }

        .theme-toggle { display:flex; align-items:center; gap:8px; background:${isDark?'#1A1A1A':'rgba(255,255,255,0.1)'}; border:1px solid ${isDark?'#2A2A2A':'rgba(255,255,255,0.2)'}; border-radius:20px; padding:4px 12px; cursor:pointer; transition:all 0.2s; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1px; color:rgba(255,255,255,0.4); text-transform:uppercase; }
        .theme-toggle:hover { border-color:#E8231A; }
        .toggle-track { width:32px; height:18px; border-radius:9px; background:${isDark?'#2A2A2A':'#E8231A'}; position:relative; transition:background 0.3s; flex-shrink:0; }
        .toggle-thumb { width:12px; height:12px; border-radius:50%; background:${isDark?'#7A7570':'#fff'}; position:absolute; top:3px; left:${isDark?'3px':'17px'}; transition:left 0.3s; }

        .main { flex:1; padding:28px 32px; overflow-y:scroll; position:relative; z-index:1; max-height:calc(100vh - 56px); }

        .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; }
        .page-title { font-family:'Bebas Neue',sans-serif; font-size:48px; letter-spacing:1px; color:${t.text}; line-height:1; }
        .page-sub { font-family:'JetBrains Mono',monospace; font-size:11px; color:${t.muted}; letter-spacing:1px; margin-top:6px; }

        /* KPI row */
        .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:28px; }
        .kpi-card { background:${t.card}; border:1px solid ${t.border}; border-radius:4px; padding:20px; position:relative; overflow:hidden; transition:background 0.3s; }
        .kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; }
        .kpi-card.red::before { background:#E8231A; }
        .kpi-card.orange::before { background:#F57C2B; }
        .kpi-card.green::before { background:#2ECC71; }
        .kpi-card.blue::before { background:#3a8fd4; }
        .kpi-val { font-family:'Bebas Neue',sans-serif; font-size:48px; line-height:1; color:${t.text}; }
        .kpi-lbl { font-family:'JetBrains Mono',monospace; font-size:10px; color:${t.muted}; letter-spacing:2px; text-transform:uppercase; margin-top:6px; }
        .kpi-sub { font-size:12px; color:${t.muted}; margin-top:4px; }

        /* Charts grid */
        .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
        .chart-card { background:${t.card}; border:1px solid ${t.border}; border-radius:4px; padding:20px; transition:background 0.3s; }
        .chart-card.full { grid-column:1/-1; }
        .chart-title { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:1px; color:${t.text}; margin-bottom:4px; }
        .chart-sub { font-family:'JetBrains Mono',monospace; font-size:10px; color:${t.muted}; letter-spacing:1px; margin-bottom:16px; }

        /* Pie legend */
        .pie-legend { display:flex; flex-wrap:wrap; gap:10px; margin-top:12px; justify-content:center; }
        .pie-legend-item { display:flex; align-items:center; gap:6px; font-family:'JetBrains Mono',monospace; font-size:11px; color:${t.muted}; }
        .pie-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

        .loading { text-align:center; padding:80px; font-family:'JetBrains Mono',monospace; font-size:12px; color:${t.muted}; letter-spacing:2px; }
      `}</style>

      <div className="an-root">
        <nav className="navbar">
          <div className="nav-logo">DISASTER<span>LINK</span></div>
          <div className="nav-right">
            <button className="nav-btn map" onClick={() => navigate('/ngo')}>← NGO Dashboard</button>
            <div className="nav-user"><span>{user.role?.toUpperCase()}</span> · {user.name}</div>
            <div className="theme-toggle" onClick={() => setIsDark(!isDark)}>
              {isDark ? '☀️' : '🌙'}
              <div className="toggle-track"><div className="toggle-thumb" /></div>
              {isDark ? 'LIGHT' : 'DARK'}
            </div>
            <button className="nav-btn export" onClick={exportPDF}>Export PDF</button>
            <button className="nav-btn" onClick={logout}>Logout</button>
          </div>
        </nav>

        <div className="main">
          {loading ? <div className="loading">Loading analytics...</div> : (
            <div ref={reportRef}>
              <div className="page-header">
                <div>
                  <div className="page-title">ANALYTICS</div>
                  <div className="page-sub">Real-time disaster relief reporting · {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="kpi-row">
                <div className="kpi-card red">
                  <div className="kpi-val">{data.totals.sos}</div>
                  <div className="kpi-lbl">Total SOS</div>
                  <div className="kpi-sub">{data.sosByStatus.pending} pending</div>
                </div>
                <div className="kpi-card green">
                  <div className="kpi-val">{data.sosByStatus.resolved}</div>
                  <div className="kpi-lbl">Resolved</div>
                  <div className="kpi-sub">{data.totals.sos > 0 ? Math.round((data.sosByStatus.resolved / data.totals.sos) * 100) : 0}% resolution rate</div>
                </div>
                <div className="kpi-card orange">
                  <div className="kpi-val">{data.totals.volunteers}</div>
                  <div className="kpi-lbl">Volunteers</div>
                  <div className="kpi-sub">{data.volunteerStats.deployed} deployed</div>
                </div>
                <div className="kpi-card blue">
                  <div className="kpi-val">{data.totals.resources}</div>
                  <div className="kpi-lbl">Resources</div>
                  <div className="kpi-sub">{data.resourceStats.filter(r => r.status === 'low').length} low stock</div>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-grid">

                {/* SOS over last 7 days */}
                <div className="chart-card full">
                  <div className="chart-title">SOS REQUESTS — LAST 7 DAYS</div>
                  <div className="chart-sub">Daily request volume</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.last7Days}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.gridColor} />
                      <XAxis dataKey="day" tick={{ fill: t.muted, fontFamily: 'JetBrains Mono', fontSize: 11 }} axisLine={{ stroke: t.border }} />
                      <YAxis tick={{ fill: t.muted, fontFamily: 'JetBrains Mono', fontSize: 11 }} axisLine={{ stroke: t.border }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="requests" fill="#E8231A" radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* SOS by Status */}
                <div className="chart-card">
                  <div className="chart-title">SOS BY STATUS</div>
                  <div className="chart-sub">Pending vs assigned vs resolved</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {statusChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-legend">
                    {statusChartData.map((item, i) => (
                      <div key={i} className="pie-legend-item">
                        <div className="pie-dot" style={{ background: item.color }} />
                        {item.name} ({item.value})
                      </div>
                    ))}
                  </div>
                </div>

                {/* SOS by Urgency */}
                <div className="chart-card">
                  <div className="chart-title">SOS BY URGENCY</div>
                  <div className="chart-sub">Distribution across urgency levels</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={urgencyChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {urgencyChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-legend">
                    {urgencyChartData.map((item, i) => (
                      <div key={i} className="pie-legend-item">
                        <div className="pie-dot" style={{ background: item.color }} />
                        {item.name} ({item.value})
                      </div>
                    ))}
                  </div>
                </div>

                {/* SOS by Type */}
                <div className="chart-card">
                  <div className="chart-title">SOS BY TYPE</div>
                  <div className="chart-sub">Disaster type breakdown</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.sosByType} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={t.gridColor} />
                      <XAxis type="number" tick={{ fill: t.muted, fontFamily: 'JetBrains Mono', fontSize: 11 }} axisLine={{ stroke: t.border }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: t.muted, fontFamily: 'JetBrains Mono', fontSize: 11 }} axisLine={{ stroke: t.border }} width={70} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0,2,2,0]}>
                        {data.sosByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Volunteer Status */}
                <div className="chart-card">
                  <div className="chart-title">VOLUNTEER STATUS</div>
                  <div className="chart-sub">Current availability breakdown</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={volunteerChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {volunteerChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-legend">
                    {volunteerChartData.map((item, i) => (
                      <div key={i} className="pie-legend-item">
                        <div className="pie-dot" style={{ background: item.color }} />
                        {item.name} ({item.value})
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resource inventory */}
                <div className="chart-card full">
                  <div className="chart-title">RESOURCE INVENTORY</div>
                  <div className="chart-sub">Current stock levels across all resources</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.resourceStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.gridColor} />
                      <XAxis dataKey="name" tick={{ fill: t.muted, fontFamily: 'JetBrains Mono', fontSize: 11 }} axisLine={{ stroke: t.border }} />
                      <YAxis tick={{ fill: t.muted, fontFamily: 'JetBrains Mono', fontSize: 11 }} axisLine={{ stroke: t.border }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="quantity" radius={[2,2,0,0]}>
                        {data.resourceStats.map((r, i) => (
                          <Cell key={i} fill={r.status === 'available' ? '#2ECC71' : r.status === 'low' ? '#F57C2B' : '#E8231A'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>
          )}
        </div>
        <Chat room="general" />
      </div>
    </>
  );
}

export default AnalyticsDashboard;