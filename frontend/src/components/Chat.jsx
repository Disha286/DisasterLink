import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import API from '../api/axios';

const socket = io('http://localhost:5000');

function Chat({ room, receiverId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!isOpen) return;

    // Join room
    socket.emit('join-room', room);

    // Load history
    API.get(`/chat/${room}`).then(res => setMessages(res.data)).catch(console.error);

    // Listen for new messages
    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => { socket.off('new-message'); };
  }, [room, isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await API.post('/chat', { message: input, room, receiver: receiverId });
      setInput('');
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');

        .chat-bubble {
          position: fixed; bottom: 24px; right: 24px; z-index: 1000;
          width: 48px; height: 48px; border-radius: 50%;
          background: #E8231A; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; box-shadow: 0 4px 16px rgba(232,35,26,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .chat-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(232,35,26,0.5); }

        .chat-window {
          position: fixed; bottom: 84px; right: 24px; z-index: 1000;
          width: 340px; height: 460px;
          background: #141414; border: 1px solid #2A2A2A; border-radius: 8px;
          display: flex; flex-direction: column;
          box-shadow: 0 16px 40px rgba(0,0,0,0.6);
          animation: slideUp 0.2s ease both;
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }

        .chat-header {
          padding: 14px 16px; border-bottom: 1px solid #2A2A2A;
          display: flex; align-items: center; justify-content: space-between;
          background: #0D0D0D; border-radius: 8px 8px 0 0;
        }
        .chat-header-title { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:1px; color:#E8E4DC; }
        .chat-header-sub { font-family:'JetBrains Mono',monospace; font-size:10px; color:#7A7570; letter-spacing:1px; margin-top:2px; }
        .chat-close { background:transparent; border:none; color:#7A7570; cursor:pointer; font-size:16px; transition:color 0.15s; }
        .chat-close:hover { color:#E8231A; }

        .chat-messages {
          flex: 1; overflow-y: auto; padding: 12px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .chat-messages::-webkit-scrollbar { width: 3px; }
        .chat-messages::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 2px; }

        .msg-wrap { display: flex; flex-direction: column; }
        .msg-wrap.mine { align-items: flex-end; }
        .msg-wrap.theirs { align-items: flex-start; }

        .msg-sender { font-family:'JetBrains Mono',monospace; font-size:10px; color:#7A7570; letter-spacing:1px; margin-bottom:3px; text-transform:uppercase; }

        .msg-bubble {
          max-width: 80%; padding: 9px 13px; border-radius: 6px;
          font-size: 13px; font-family:'DM Sans',sans-serif; line-height: 1.4;
        }
        .msg-bubble.mine { background: #E8231A; color: #fff; border-radius: 6px 6px 2px 6px; }
        .msg-bubble.theirs { background: #1A1A1A; color: #E8E4DC; border: 1px solid #2A2A2A; border-radius: 6px 6px 6px 2px; }

        .msg-time { font-family:'JetBrains Mono',monospace; font-size:9px; color:#3a3a3a; margin-top:3px; }

        .chat-input-wrap {
          padding: 12px; border-top: 1px solid #2A2A2A;
          display: flex; gap: 8px; align-items: center;
        }
        .chat-input {
          flex: 1; padding: 9px 12px; background: #1A1A1A;
          border: 1px solid #2A2A2A; border-radius: 4px;
          font-size: 13px; font-family:'DM Sans',sans-serif; color: #E8E4DC;
          outline: none; transition: border-color 0.2s;
        }
        .chat-input:focus { border-color: #E8231A; }
        .chat-input::placeholder { color: #3a3a3a; }
        .chat-send {
          padding: 9px 14px; background: #E8231A; border: none; border-radius: 4px;
          color: #fff; cursor: pointer; font-family:'JetBrains Mono',monospace;
          font-size: 11px; letter-spacing: 1px; transition: background 0.15s;
        }
        .chat-send:hover { background: #c41d15; }

        .chat-empty { text-align:center; padding:40px 20px; font-family:'JetBrains Mono',monospace; font-size:11px; color:#3a3a3a; letter-spacing:2px; text-transform:uppercase; }
      `}</style>

      {/* Floating button */}
      <button className="chat-bubble" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div>
              <div className="chat-header-title">LIVE CHAT</div>
              <div className="chat-header-sub">Room: {room}</div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">No messages yet</div>
            ) : messages.map((msg, i) => {
                const senderId = msg.sender?._id || msg.sender;
                const isMine = senderId === user.id;

              return (
                <div key={i} className={`msg-wrap ${isMine ? 'mine' : 'theirs'}`}>
                  {!isMine && <div className="msg-sender">{msg.sender?.name}</div>}
                  <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>{msg.message}</div>
                  <div className="msg-time">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form className="chat-input-wrap" onSubmit={sendMessage}>
            <input
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button className="chat-send" type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chat;