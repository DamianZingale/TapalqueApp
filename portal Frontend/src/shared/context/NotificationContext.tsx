import { Client } from '@stomp/stompjs';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import SockJS from 'sockjs-client';
import { authService } from '../../services/authService';

export interface AppNotification {
  id: string;
  type: 'pedido' | 'reserva' | 'pedido:estado';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  businessId?: string;
  businessName?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>
  ) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = 'app_notifications';
const MAX_NOTIFICATIONS = 50;

const ESTADO_LABELS: Record<string, string> = {
  RECIBIDO: 'Recibido',
  EN_PREPARACION: 'En preparacion',
  LISTO: 'Listo',
  EN_DELIVERY: 'En camino',
  ENTREGADO: 'Entregado',
};

function loadNotifications(): AppNotification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as AppNotification[];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: AppNotification[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS))
  );
}

function getWsUrl(): string {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
  let origin = '';
  if (API_BASE.startsWith('http')) {
    const url = new URL(API_BASE);
    origin = url.origin;
  }
  return `${origin}/ws/pedidos`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(loadNotifications);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const addNotification = useCallback(
    (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: AppNotification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) =>
        [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS)
      );
    },
    []
  );

  // WebSocket connection for user-specific notifications
  useEffect(() => {
    const user = authService.getUser();
    if (!user?.id) return;

    // Only connect for regular users (ROL 3)
    // Admins/moderators get notifications via the admin panel WebSocket
    const rol = Number(user.rol);
    if (rol === 2) return;

    const userId = String(user.id);
    const wsUrl = getWsUrl();

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log('WebSocket usuario conectado');

        client.subscribe(`/topic/pedidos/user/${userId}`, (message) => {
          try {
            const data = JSON.parse(message.body);

            if (data.type === 'pedido:estado') {
              const status = data.status || data.payload?.status;
              const restaurantName =
                data.restaurantName ||
                data.payload?.restaurant?.restaurantName ||
                'Restaurante';
              const statusLabel = ESTADO_LABELS[status] || status;

              addNotification({
                type: 'pedido:estado',
                title: `Pedido ${statusLabel}`,
                message: `Tu pedido de ${restaurantName} cambio a: ${statusLabel}`,
                businessName: restaurantName,
              });
            }
            if (data.type === 'reserva') {
              const restaurantName =
                data.restaurantName ||
                data.payload?.restaurant?.restaurantName ||
                'Restaurante';

              const fecha = data.fecha || data.payload?.fecha;
              const hora = data.hora || data.payload?.hora;

              addNotification({
                type: 'reserva',
                title: 'Reserva confirmada',
                message: `Tu reserva en ${restaurantName} para el ${fecha} a las ${hora} fue registrada.`,
                businessName: restaurantName,
              });
            }
          } catch (error) {
            console.error('Error parsing user notification:', error);
          }
        });
      },

      onStompError: (frame) => {
        console.error('STOMP error (user):', frame.headers['message']);
      },

      onWebSocketClose: () => {
        console.log('WebSocket usuario desconectado');
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [addNotification]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
}
