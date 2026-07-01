import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import { WS_URL } from '../api/config';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../Service/NotificationService';

const fetchStoredSessionProfile = () => {
  const fallback = { name: 'Admin User', role: 'Administrator', initials: 'AD' };
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed?.name) {
        const parts = parsed.name.trim().split(' ');
        parsed.initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
      } else {
        parsed.name = 'Admin User';
        parsed.initials = 'AD';
      }
      if (!parsed.role) parsed.role = 'Administrator';
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse session profile', e);
  }
  return fallback;
};

function TimeDisplay() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

function IconBtn({ onClick, title, badge, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        position: 'relative',
        width: 36, height: 36,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.55)',
        cursor: 'pointer',
        transition: 'all 0.18s',
        flexShrink: 0,
        outline: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
      }}
    >
      {children}
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: 5, right: 5,
          minWidth: 14, height: 14,
          background: '#e8a838',
          color: '#0f1e3c',
          fontSize: 8, fontWeight: 800,
          borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid #0f1e3c',
          padding: '0 3px',
          lineHeight: 1,
          animation: 'pulse 2s infinite',
        }}>{badge}</span>
      )}
    </button>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [user, setUser] = useState(() => fetchStoredSessionProfile());

  const notifsRef = useRef(null);
  const profileRef = useRef(null);
  const stompClientRef = useRef(null);

  const unreadCount = notifs.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchHistoricalNotifications();

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/notifications', (message) => {
          if (message.body) {
            const newNotif = JSON.parse(message.body);
            setNotifs(prev => [newNotif, ...prev]);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
    });
    client.activate();
    stompClientRef.current = client;

    const syncProfile = () => setUser(fetchStoredSessionProfile());
    window.addEventListener('userLogin', syncProfile);

    const handleOutside = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleOutside);

    return () => {
      window.removeEventListener('userLogin', syncProfile);
      document.removeEventListener('mousedown', handleOutside);
      stompClientRef.current?.deactivate();
    };
  }, []);

  const fetchHistoricalNotifications = async () => {
    try {
      const res = await getNotifications();
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifs(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Mark read error', err);
    }
  };

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.isRead);
    try {
      await markAllNotificationsRead(unread.map((n) => n.id));
      setNotifs(prev => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Batch mark-read error', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser({ name: 'Admin User', role: 'Administrator', initials: 'AD' });
    navigate('/login');
  };

  const dropdownCard = {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    background: '#fff',
    borderRadius: 18,
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
    zIndex: 999,
    overflow: 'hidden',
    animation: 'dropIn 0.18s ease',
  };

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .notif-row { transition: background 0.15s; }
        .notif-row:hover { background: #f8f9ff; }
        .notif-row:hover .mark-btn { opacity: 1; transform: translateX(0); }
        .mark-btn {
          opacity: 0;
          transform: translateX(8px);
          transition: all 0.18s;
        }
        .nav-search-input::placeholder { color: rgba(255,255,255,0.3); }
        .nav-search-input:focus { outline: none; }
        .profile-menu-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 16px;
          background: none; border: none;
          font-size: 13px; color: #1e1b4b;
          cursor: pointer; text-align: left;
          transition: background 0.12s;
        }
        .profile-menu-btn:hover { background: #f5f6ff; }
        .profile-menu-btn.danger { color: #dc2626; }
        .profile-menu-btn.danger:hover { background: #fff5f5; }
      `}</style>

      <header style={{
        height: 60,
        background: 'linear-gradient(90deg, #0d1b38 0%, #0f2147 100%)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* ── Brand ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 210, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34,
            background: '#e8a838',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(232,168,56,0.35)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f1e3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L2 8l10 5 10-5-10-5z" />
              <path d="M2 16l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.01em' }}>Mitch Academy</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>School System</div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* ── Search ── */}
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', gap: 8,
          background: searchFocus ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${searchFocus ? 'rgba(232,168,56,0.4)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 12,
          padding: '0 12px',
          height: 36,
          transition: 'all 0.2s',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search students, teachers, classes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            style={{
              background: 'none', border: 'none',
              color: '#fff', fontSize: 12, flex: 1,
              fontFamily: 'inherit',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>✕</button>
          )}
        </div>

        {/* ── Right side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

          {/* Live clock */}
          <TimeDisplay />

          {/* Divider */}
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          {/* Messages */}
          <IconBtn onClick={() => navigate('/messages')} title="Messages">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </IconBtn>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifsRef}>
            <IconBtn
              onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
              title="Notifications"
              badge={unreadCount}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </IconBtn>

            {showNotifs && (
              <div style={{ ...dropdownCard, width: 320 }}>
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f3f9',
                  background: '#fafbff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{
                        background: '#e8a838', color: '#0f1e3c',
                        fontSize: 9, fontWeight: 800,
                        padding: '2px 7px', borderRadius: 20,
                      }}>{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{ fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                    >Mark all read</button>
                  )}
                </div>

                {/* List */}
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>No notifications yet</div>
                    </div>
                  ) : (
                    notifs.map(n => (
                      <div
                        key={n.id}
                        className="notif-row"
                        style={{
                          display: 'flex', gap: 10,
                          padding: '10px 16px',
                          borderBottom: '1px solid #f8f9ff',
                          background: !n.isRead ? 'rgba(99,102,241,0.03)' : '#fff',
                          position: 'relative',
                        }}
                      >
                        {/* Unread dot */}
                        <div style={{ paddingTop: 4, flexShrink: 0 }}>
                          <div style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: !n.isRead ? '#e8a838' : 'transparent',
                            transition: 'background 0.2s',
                          }} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 12,
                            fontWeight: !n.isRead ? 700 : 500,
                            color: '#1e1b4b',
                            margin: '0 0 3px',
                            lineHeight: 1.4,
                          }}>{n.title}</p>
                          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {n.message}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!n.isRead && (
                              <button
                                className="mark-btn"
                                onClick={e => handleMarkAsRead(n.id, e)}
                                style={{
                                  fontSize: 10, fontWeight: 600,
                                  background: '#1e1b4b', color: '#fff',
                                  border: 'none', borderRadius: 6,
                                  padding: '3px 10px', cursor: 'pointer',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#e8a838'; e.currentTarget.style.color = '#0f1e3c'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#1e1b4b'; e.currentTarget.style.color = '#fff'; }}
                              >Mark read</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f3f9', textAlign: 'center', background: '#fafbff' }}>
                  <button
                    onClick={() => navigate('/notifications')}
                    style={{ fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >View all notifications →</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
              title={user.name}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #e8a838 0%, #f0c060 100%)',
                color: '#0f1e3c',
                fontSize: 13, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(232,168,56,0.3)',
                cursor: 'pointer',
                flexShrink: 0,
                textTransform: 'uppercase',
                boxShadow: '0 2px 10px rgba(232,168,56,0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                outline: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {user.initials}
            </button>

            {showProfile && (
              <div style={{ ...dropdownCard, width: 220 }}>
                {/* Profile header */}
                <div style={{ padding: '14px 16px', background: '#fafbff', borderBottom: '1px solid #f1f3f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e8a838, #f0c060)',
                      color: '#0f1e3c', fontSize: 14, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textTransform: 'uppercase', flexShrink: 0,
                    }}>{user.initials}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{user.name}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1, textTransform: 'capitalize' }}>{user.role}</div>
                    </div>
                  </div>
                  {/* Online indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 2px rgba(34,197,94,0.2)' }} />
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>Online</span>
                  </div>
                </div>

                <div style={{ padding: '6px 0' }}>
                  <button className="profile-menu-btn" onClick={() => navigate('/profile')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    My Profile
                  </button>
                  <button className="profile-menu-btn" onClick={() => navigate('/settings')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Settings
                  </button>
                </div>

                <div style={{ height: 1, background: '#f1f3f9' }} />

                <div style={{ padding: '6px 0' }}>
                  <button className="profile-menu-btn danger" onClick={handleLogout}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;