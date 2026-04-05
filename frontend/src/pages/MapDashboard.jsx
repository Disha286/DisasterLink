import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../api/axios';
import Chat from '../components/Chat';
import useSocketNotifications from '../hooks/useSocketNotifications';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const urgencyConfig = {
  critical: { color: '#E8231A', label: 'CRITICAL' },
  high:     { color: '#F57C2B', label: 'HIGH' },
  medium:   { color: '#F5C842', label: 'MEDIUM' },
  low:      { color: '#2ECC71', label: 'LOW' },
};

const getMarkerIcon = (urgency) => {
  const color = urgencyConfig[urgency]?.color || '#7A7570';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px; height:14px; border-radius:50%;
      background:${color}; border:2px solid rgba(255,255,255,0.3);
      box-shadow:0 0 8px ${color}88;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const themes = {
  dark: {
    bg: '#0D0D0D', mid: '#1A1A1A', card: '#141414',
    border: '#2A2A2A', text: '#E8E4DC', muted: '#7A7570',
    navBg: '#0D0D0D', statsBg: '#141414',
    mapTile: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    mapAttr: '&copy; <a href="https://carto.com">CARTO</a>',
    popupBg: '#141414', popupBorder: '#2A2A2A', popupText: '#E8E4DC',
    inputBg: '#1A1A1A', inputBorder: '#3a3a3a',
  },
  light: {
    bg: '#f5f3ee', mid: '#ffffff', card: '#ffffff',
    border: '#e2ddd5', text: '#1a1814', muted: '#8a8278',
    navBg: '#1a1814', statsBg: '#f0ede6',
    mapTile: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    mapAttr: '&copy; <a href="https://carto.com">CARTO</a>',
    popupBg: '#ffffff', popupBorder: '#e2ddd5', popupText: '#1a1814',
    inputBg: '#f0ede6', inputBorder: '#e2ddd5',
  }
};

function MapDashboard() {
  const [sosRequests, setSosRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isDark, setIsDark] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const t = isDark ? themes.dark : themes.light;
  useSocketNotifications();

  const fetchSOS = async () => {
    try {
      const res = await API.get('/sos/all');
      setSosRequests(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSOS();
    const interval = setInterval(fetchSOS, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = sosRequests.filter(s => filter === 'all' || s.urgency === filter);
  const counts = {
    critical: sosRequests.filter(s => s.urgency === 'critical').length,
    high:     sosRequests.filter(s => s.urgency === 'high').length,
    medium:   sosRequests.filter(s => s.urgency === 'medium').length,
    low:      sosRequests.filter(s => s.urgency === 'low').length,
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .map-root {
          height: 100vh; width: 100vw;
          display: flex; flex-direction: column;
          background: ${t.bg};
          color: ${t.text};
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
          transition: background 0.3s, color 0.3s;
        }

        ${isDark ? `
        .map-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; opacity: 0.4;
        }` : ''}

        .navbar {
          background: ${t.navBg};
          border-bottom: 1px solid ${t.border};
          padding: 0 32px; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0; position: relative; z-index: 100;
          transition: background 0.3s, border-color 0.3s;
        }

        .nav-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: 1px; color: #E8E4DC;
        }
        .nav-logo span { color: #E8231A; }

        .nav-center { display: flex; align-items: center; gap: 6px; }

        .filter-btn {
          padding: 5px 14px; border-radius: 2px;
          border: 1px solid ${isDark ? '#2A2A2A' : 'rgba(255,255,255,0.2)'};
          background: transparent;
          color: ${isDark ? '#7A7570' : 'rgba(255,255,255,0.5)'};
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; gap: 6px;
        }
        .filter-btn:hover { border-color: #E8231A; color: #E8E4DC; }
        .filter-btn.active { background: #E8231A; border-color: #E8231A; color: #fff; }

        .filter-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }

        .nav-right { display: flex; align-items: center; gap: 12px; }

        .nav-user {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: rgba(255,255,255,0.4);
          letter-spacing: 1px; text-transform: uppercase;
        }
        .nav-user span { color: #F57C2B; }

        /* Theme toggle */
        .theme-toggle {
          display: flex; align-items: center; gap: 8px;
          background: ${isDark ? '#1A1A1A' : 'rgba(255,255,255,0.1)'};
          border: 1px solid ${isDark ? '#2A2A2A' : 'rgba(255,255,255,0.2)'};
          border-radius: 20px; padding: 4px 12px;
          cursor: pointer; transition: all 0.2s;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 1px;
          color: ${isDark ? '#7A7570' : 'rgba(255,255,255,0.5)'};
          text-transform: uppercase;
        }
        .theme-toggle:hover { border-color: #E8231A; }

        .toggle-track {
          width: 32px; height: 18px; border-radius: 9px;
          background: ${isDark ? '#2A2A2A' : '#E8231A'};
          position: relative; transition: background 0.3s;
          flex-shrink: 0;
        }
        .toggle-thumb {
          width: 12px; height: 12px; border-radius: 50%;
          background: ${isDark ? '#7A7570' : '#fff'};
          position: absolute; top: 3px;
          left: ${isDark ? '3px' : '17px'};
          transition: left 0.3s, background 0.3s;
        }

        .logout-btn {
          padding: 5px 14px; background: transparent;
          border: 1px solid ${isDark ? '#2A2A2A' : 'rgba(255,255,255,0.2)'};
          color: ${isDark ? '#7A7570' : 'rgba(255,255,255,0.5)'};
          border-radius: 2px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
          cursor: pointer; transition: all 0.15s;
        }
        .logout-btn:hover { border-color: #E8231A; color: #E8231A; }

        /* Stats bar */
        .stats-bar {
          background: ${t.statsBg};
          border-bottom: 1px solid ${t.border};
          padding: 0 32px; height: 44px;
          display: flex; align-items: center; gap: 32px;
          flex-shrink: 0; position: relative; z-index: 100;
          transition: background 0.3s, border-color 0.3s;
        }
        .stats-bar-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 2px;
          color: ${t.muted}; text-transform: uppercase;
        }
        .stat-item { display: flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
        .stat-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .stat-count { color: ${t.text}; font-weight: 600; }
        .stat-lbl { color: ${t.muted}; }

        .stats-bar-right {
          margin-left: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: ${t.muted};
          letter-spacing: 1px;
          display: flex; align-items: center; gap: 6px;
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2ECC71;
          animation: blink 1.5s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .map-container { flex: 1; position: relative; z-index: 1; }
        .leaflet-container { width: 100% !important; height: 100% !important; }

        .leaflet-popup-content-wrapper {
          background: ${t.popupBg} !important;
          border: 1px solid ${t.popupBorder} !important;
          border-radius: 4px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
          color: ${t.popupText} !important;
        }
        .leaflet-popup-tip { background: ${t.popupBg} !important; }
        .leaflet-popup-content { margin: 16px !important; }

        .popup-wrap { font-family: 'DM Sans', sans-serif; min-width: 180px; }
        .popup-type { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; color: ${t.popupText}; margin-bottom: 4px; }
        .popup-badge { display: inline-block; padding: 2px 8px; border-radius: 2px; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
        .popup-desc { font-size: 13px; color: ${t.muted}; line-height: 1.5; margin-bottom: 8px; }
        .popup-meta { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: ${t.muted}; }
      `}</style>

      <div className="map-root">
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-logo">DISASTER<span>LINK</span></div>

          <div className="nav-center">
            {['all','critical','high','medium','low'].map(f => (
              <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}>
                {f !== 'all' && <span className="filter-dot" style={{ background: urgencyConfig[f]?.color }} />}
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="nav-right">
            <div className="nav-user">
              <span>{user.role?.toUpperCase()}</span> · {user.name}
            </div>

            {/* Theme toggle */}
            <div className="theme-toggle" onClick={() => setIsDark(!isDark)}>
              {isDark ? '☀️' : '🌙'}
              <div className="toggle-track">
                <div className="toggle-thumb" />
              </div>
              {isDark ? 'LIGHT' : 'DARK'}
            </div>

            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </nav>

        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stats-bar-label">Active Requests</div>
          {Object.entries(counts).map(([key, count]) => (
            <div key={key} className="stat-item">
              <span className="stat-dot" style={{ background: urgencyConfig[key].color }} />
              <span className="stat-count">{count}</span>
              <span className="stat-lbl">{key}</span>
            </div>
          ))}
          <div className="stats-bar-right">
            <div className="live-dot" />
            LIVE · {lastUpdated || 'Loading...'}
          </div>
        </div>

        {/* Map */}
        <div className="map-container">
          <MapContainer center={[12.9716, 77.5946]} zoom={11} style={{ width:'100%', height:'100%' }}>
            <TileLayer key={isDark ? 'dark' : 'light'} url={t.mapTile} attribution={t.mapAttr} />
            {filtered.map(sos =>
              sos.location?.lat && sos.location?.lng ? (
                <Marker key={sos._id}
                  position={[sos.location.lat, sos.location.lng]}
                  icon={getMarkerIcon(sos.urgency)}>
                  <Popup>
                    <div className="popup-wrap">
                      <div className="popup-type">{sos.type?.toUpperCase()}</div>
                      <div className="popup-badge" style={{
                        background: urgencyConfig[sos.urgency]?.color + '22',
                        color: urgencyConfig[sos.urgency]?.color,
                        border: `1px solid ${urgencyConfig[sos.urgency]?.color}44`
                      }}>{sos.urgency}</div>
                      <div className="popup-desc">{sos.description}</div>
                      <div className="popup-meta">
                        📍 {sos.location?.address}<br />
                        STATUS · {sos.status?.toUpperCase()}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>
        <Chat room="general" />
      </div>
    </>
  );
}

export default MapDashboard;