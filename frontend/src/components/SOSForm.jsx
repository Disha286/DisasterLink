import { useState, useEffect } from 'react';
import API from '../api/axios';
import { queueSOS, getQueuedSOS, removeQueuedSOS } from '../utils/offlineQueue';
import toast from 'react-hot-toast';

function SOSForm() {
  const [form, setForm] = useState({ type:'flood', description:'', urgency:'critical', address:'', lat:'', lng:'' });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueuedSOS();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    loadQueueCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadQueueCount = async () => {
    const queued = await getQueuedSOS();
    setQueuedCount(queued.length);
  };

  const syncQueuedSOS = async () => {
    const queued = await getQueuedSOS();
    if (queued.length === 0) return;

    toast(`📡 Back online! Syncing ${queued.length} queued SOS request(s)...`, {
      style: { background:'#141414', color:'#F5C842', border:'1px solid rgba(245,200,66,0.3)', fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }
    });

    for (const sos of queued) {
      try {
        await API.post('/sos/submit', {
          type: sos.type,
          description: sos.description,
          urgency: sos.urgency,
          address: sos.address,
          lat: sos.lat,
          lng: sos.lng
        });
        await removeQueuedSOS(sos.id);
        toast.success(`✅ SOS synced: ${sos.type} - ${sos.urgency}`);
      } catch (err) {
        console.error('Sync failed for:', sos);
      }
    }
    loadQueueCount();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOnline) {
      await queueSOS(form);
      loadQueueCount();
      toast(`📴 Offline — SOS saved locally. Will auto-send when connected.`, {
        duration: 6000,
        style: { background:'#141414', color:'#F57C2B', border:'1px solid rgba(245,124,43,0.3)', fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }
      });
      setIsOpen(false);
      return;
    }

    try {
      await API.post('/sos/submit', form);
      toast.error(`🆘 SOS submitted: ${form.type} - ${form.urgency}`);
      setIsOpen(false);
      setForm({ type:'flood', description:'', urgency:'critical', address:'', lat:'', lng:'' });
    } catch (err) {
      // If request fails, queue it
      await queueSOS(form);
      loadQueueCount();
      toast(`⚠️ Submit failed — SOS queued for retry`, {
        style: { background:'#141414', color:'#F57C2B', border:'1px solid rgba(245,124,43,0.3)', fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }
      });
    }
  };

  return (
    <>
      <style>{`
        .sos-fab {
          position: fixed; bottom: 84px; left: 24px; z-index: 1000;
          display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
        }
        .sos-fab-btn {
          background: #E8231A; border: none; border-radius: 4px;
          color: #fff; cursor: pointer; padding: 10px 20px;
          font-family: 'JetBrains Mono', monospace; font-size: 12px;
          letter-spacing: 2px; text-transform: uppercase;
          box-shadow: 0 4px 16px rgba(232,35,26,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; gap: 8px;
        }
        .sos-fab-btn:hover { transform: scale(1.04); }
        .offline-badge {
          background: rgba(245,124,43,0.15); border: 1px solid rgba(245,124,43,0.4);
          color: #F57C2B; padding: 4px 10px; border-radius: 2px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1px;
        }

        .sos-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8);
          z-index: 1001; display: flex; align-items: center; justify-content: center;
        }
        .sos-modal {
          background: #141414; border: 1px solid #2A2A2A; border-radius: 8px;
          padding: 32px; width: 440px; position: relative;
          box-shadow: 0 24px 60px rgba(0,0,0,0.6);
        }
        .sos-modal-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #E8231A; border-radius: 8px 8px 0 0; }
        .sos-modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 1px; color: #E8E4DC; margin-bottom: 4px; }
        .sos-modal-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #7A7570; margin-bottom: 24px; letter-spacing: 1px; }
        .sos-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 1px; color: #7A7570; text-transform: uppercase; margin-bottom: 6px; }
        .sos-input { width: 100%; padding: 10px 12px; background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 4px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #E8E4DC; outline: none; margin-bottom: 14px; }
        .sos-input:focus { border-color: #E8231A; }
        .sos-select { width: 100%; padding: 10px 12px; background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 4px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #E8E4DC; outline: none; margin-bottom: 14px; }
        .sos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .sos-submit { width: 100%; padding: 12px; background: #E8231A; border: none; border-radius: 4px; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; margin-top: 4px; }
        .sos-submit:hover { background: #c41d15; }
        .offline-warning { background: rgba(245,124,43,0.1); border: 1px solid rgba(245,124,43,0.3); color: #F57C2B; padding: 10px 14px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; margin-bottom: 16px; letter-spacing: 1px; }
      `}</style>

      <div className="sos-fab">
        {!isOnline && <div className="offline-badge">📴 OFFLINE</div>}
        {queuedCount > 0 && <div className="offline-badge" style={{ color:'#F5C842', borderColor:'rgba(245,200,66,0.4)', background:'rgba(245,200,66,0.1)' }}>⏳ {queuedCount} SOS QUEUED</div>}
        <button className="sos-fab-btn" onClick={() => setIsOpen(true)}>
          🆘 SEND SOS
        </button>
      </div>

      {isOpen && (
        <div className="sos-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="sos-modal" onClick={e => e.stopPropagation()}>
            <div className="sos-modal-bar" />
            <div className="sos-modal-title">SEND SOS</div>
            <div className="sos-modal-sub">{isOnline ? '🟢 ONLINE · Will submit immediately' : '📴 OFFLINE · Will queue and auto-send when connected'}</div>

            {!isOnline && <div className="offline-warning">⚠ You are offline. Your SOS will be saved locally and automatically sent when your connection is restored.</div>}

            <form onSubmit={handleSubmit}>
              <div className="sos-grid">
                <div>
                  <label className="sos-label">Type</label>
                  <select className="sos-select" value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
                    {['flood','earthquake','fire','medical','rescue','food','other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="sos-label">Urgency</label>
                  <select className="sos-select" value={form.urgency} onChange={e => setForm({...form, urgency:e.target.value})}>
                    {['critical','high','medium','low'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <label className="sos-label">Description</label>
              <textarea className="sos-input" rows={3} placeholder="Describe the emergency..." value={form.description} onChange={e => setForm({...form, description:e.target.value})} required style={{resize:'none'}} />
              <label className="sos-label">Location</label>
              <input className="sos-input" placeholder="Your address / landmark" value={form.address} onChange={e => setForm({...form, address:e.target.value})} required />
              <div className="sos-grid">
                <div>
                  <label className="sos-label">Latitude</label>
                  <input className="sos-input" placeholder="12.9716" value={form.lat} onChange={e => setForm({...form, lat:e.target.value})} />
                </div>
                <div>
                  <label className="sos-label">Longitude</label>
                  <input className="sos-input" placeholder="77.5946" value={form.lng} onChange={e => setForm({...form, lng:e.target.value})} />
                </div>
              </div>
              <button className="sos-submit" type="submit">
                {isOnline ? 'Submit SOS →' : 'Queue SOS (Offline) →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SOSForm;