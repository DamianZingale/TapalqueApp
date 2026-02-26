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
import { api } from '../../config/api';
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
  /** Registra un tópico admin para mantener la conexión WebSocket de forma persistente
   * aunque el componente se desmonte. Útil para que el admin reciba notificaciones
   * en la campana aunque navegue a otra sección. */
  registerAdminTopic: (businessId: string, businessType: 'HOSPEDAJE' | 'GASTRONOMIA') => void;
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
  FAILED: 'Cancelado',
};

interface AdminBusinessDTO {
  externalBusinessId: number | string;
  businessType: 'GASTRONOMIA' | 'HOSPEDAJE';
}

function sendBrowserNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/logo-tapalque.png' });
}

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

function getWsOrigin(): string {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
  if (API_BASE.startsWith('http')) {
    return new URL(API_BASE).origin;
  }
  return '';
}

function getWsUrl(): string {
  return `${getWsOrigin()}/ws/pedidos`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(loadNotifications);
  const clientRef = useRef<Client | null>(null);
  // Mapa de conexiones persistentes para admin (businessId → Client)
  const adminClientsRef = useRef<Map<string, Client>>(new Map());

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
      sendBrowserNotification(notification.title, notification.message);
    },
    []
  );

  // WebSocket connection for user-specific notifications
  useEffect(() => {
    const user = authService.getUser();
    if (!user?.id) return;

    // Only connect for regular users (ROL 3)
    // Admins/moderators get notifications via registerAdminTopic
    const rol = Number(user.rol);
    if (rol !== 3) return;

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

  // Pedir permiso para notificaciones de navegador al montar
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const registerAdminTopic = useCallback(
    (businessId: string, businessType: 'HOSPEDAJE' | 'GASTRONOMIA') => {
      if (!businessId || adminClientsRef.current.has(businessId)) return;

      const wsService = businessType === 'GASTRONOMIA' ? 'pedidos' : 'reservas';
      const wsUrl = `${getWsOrigin()}/ws/${wsService}`;
      const topic =
        businessType === 'GASTRONOMIA'
          ? `/topic/pedidos/${businessId}`
          : `/topic/reservas/${businessId}`;

      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        onConnect: () => {
          client.subscribe(topic, (message) => {
            try {
              const data = JSON.parse(message.body);

              if (data.type === 'reserva:nueva') {
                const p = data.payload;
                addNotification({
                  type: 'reserva',
                  title: 'Nueva reserva',
                  message: `${p?.customer?.customerName ?? 'Cliente'} — Check-in: ${new Date(p?.stayPeriod?.checkInDate).toLocaleDateString('es-AR')}`,
                  businessId,
                });
              } else if (data.type === 'reserva:actualizada' && data.payload?.isCancelled) {
                const p = data.payload;
                addNotification({
                  type: 'reserva',
                  title: 'Reserva cancelada',
                  message: `Cancelada: ${p?.customer?.customerName ?? 'Cliente'}`,
                  businessId,
                });
              } else if (data.type === 'pedido:nuevo') {
                addNotification({
                  type: 'pedido',
                  title: 'Nuevo pedido',
                  message: `Pedido recibido en tu negocio`,
                  businessId,
                });
              } else if (data.type === 'pedido:actualizado' && data.payload?.status === 'FAILED') {
                const p = data.payload;
                const cliente = p?.userName ?? 'Cliente';
                addNotification({
                  type: 'pedido',
                  title: 'Pedido cancelado',
                  message: `${cliente} canceló su pedido`,
                  businessId,
                });
              }
            } catch {
              // ignorar mensajes malformados
            }
          });
        },

        onWebSocketClose: () => {
          adminClientsRef.current.delete(businessId);
        },
      });

      client.activate();
      adminClientsRef.current.set(businessId, client);
    },
    [addNotification]
  );

  // Auto-registrar topics para admin/moderador al iniciar sesión
  useEffect(() => {
    const user = authService.getUser();
    if (!user?.id) return;
    const rol = Number(user.rol);
    if (rol !== 1 && rol !== 2) return;

    api
      .get<AdminBusinessDTO[]>(`/business/user/${user.id}`)
      .then((businesses) => {
        if (!Array.isArray(businesses)) return;
        businesses.forEach((b) => {
          registerAdminTopic(String(b.externalBusinessId), b.businessType);
        });
      })
      .catch(() => {
        // silencioso: si falla, el admin puede navegar al panel para reconectar
      });
  }, [registerAdminTopic]);

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
        registerAdminTopic,
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
