import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

function useSocketNotifications() {
  useEffect(() => {
    // New SOS alert
    socket.on('new-sos', (data) => {
      toast.error(`🆘 NEW SOS: ${data.type?.toUpperCase()} — ${data.urgency?.toUpperCase()}`, {
        duration: 6000,
        style: {
          background: '#141414',
          color: '#E8231A',
          border: '1px solid rgba(232,35,26,0.3)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
        }
      });
    });

    // Low stock alert
    socket.on('low-stock-alert', (data) => {
      toast(`⚠ LOW STOCK: ${data.resource} — ${data.quantity} remaining`, {
        duration: 5000,
        style: {
          background: '#141414',
          color: '#F57C2B',
          border: '1px solid rgba(245,124,43,0.3)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
        }
      });
    });

    // Broadcast alert
    socket.on('broadcast', (data) => {
      toast(`📢 ${data.title} — ${data.zone}`, {
        duration: 6000,
        style: {
          background: '#141414',
          color: '#F5C842',
          border: '1px solid rgba(245,200,66,0.3)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
        }
      });
    });

    return () => {
      socket.off('new-sos');
      socket.off('low-stock-alert');
      socket.off('broadcast');
    };
  }, []);
}

export default useSocketNotifications;