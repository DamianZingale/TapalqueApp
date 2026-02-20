import React, { useEffect, useRef, useState } from 'react';
import { Badge } from 'react-bootstrap';
import {
  useNotifications,
  type AppNotification,
} from '../context/NotificationContext';

export function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const getDropdownStyle = (): React.CSSProperties => {
    const rect = buttonRef.current?.getBoundingClientRect();
    const top = rect ? rect.bottom + 8 : 60;
    const vw = window.innerWidth;
    const dropW = Math.min(340, vw - 16);
    // Alinear borde derecho con el botón, pero clampear para no salir del viewport
    const naturalRight = rect ? vw - rect.right : 8;
    const right = Math.max(8, Math.min(naturalRight, vw - dropW - 8));
    return {
      position: 'fixed',
      top,
      right,
      width: dropW,
    };
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Hace ${diffH}h`;
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getIcon = (type: AppNotification['type']) => {
    if (type === 'pedido:estado') return '📦';
    return type === 'pedido' ? '🍽️' : '🏨';
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="btn btn-link nav-link position-relative p-1 ms-2"
        style={{ fontSize: '1.25rem', lineHeight: 1, color: '#dee2e6' }}
        title="Notificaciones"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
        </svg>
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute"
            style={{
              top: '-2px',
              right: '-6px',
              fontSize: '0.65rem',
              minWidth: '18px',
              padding: '3px 5px',
              animation: 'bellPulse 2s ease-in-out infinite',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {open && (
        <div
          className="shadow-lg border rounded"
          style={{
            ...getDropdownStyle(),
            maxHeight: '420px',
            backgroundColor: '#fff',
            zIndex: 1050,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            className="d-flex justify-content-between align-items-center px-3 py-2"
            style={{
              borderBottom: '1px solid #e9ecef',
              backgroundColor: '#f8f9fa',
            }}
          >
            <strong style={{ fontSize: '0.9rem' }}>Notificaciones</strong>
            {notifications.length > 0 && (
              <button
                className="btn btn-link btn-sm text-muted p-0"
                onClick={clearNotifications}
                style={{ fontSize: '0.75rem', textDecoration: 'none' }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Content */}
          <div style={{ overflowY: 'auto', maxHeight: '360px' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  className="mb-2 opacity-50"
                >
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
                </svg>
                <p className="small mb-0">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-3 py-2"
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: n.read ? 'transparent' : '#f0f7ff',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div className="d-flex align-items-start gap-2">
                    <span style={{ fontSize: '1.1rem' }}>
                      {getIcon(n.type)}
                    </span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <strong style={{ fontSize: '0.82rem' }}>
                          {n.title}
                        </strong>
                        <small
                          className="text-muted"
                          style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                        >
                          {formatTime(n.timestamp)}
                        </small>
                      </div>
                      <p
                        className="mb-0 text-muted"
                        style={{ fontSize: '0.78rem' }}
                      >
                        {n.message}
                      </p>
                      {n.businessName && (
                        <small
                          className="text-muted"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {n.businessName}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bellPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
