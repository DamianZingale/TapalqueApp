import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { WebSocketMessage, BusinessType } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;

function getWsUrl(businessType: BusinessType): string {
  const base = API_BASE.replace(/\/+$/, '');
  if (businessType === 'GASTRONOMIA') {
    return `${base}/ws/pedidos`;
  }
  return `${base}/ws/reservas`;
}

function getTopic(businessId: string, businessType: BusinessType): string {
  if (businessType === 'GASTRONOMIA') {
    return `/topic/pedidos/${businessId}`;
  }
  return `/topic/reservas/${businessId}`;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
}

export function useWebSocket(businessId: string, businessType: BusinessType): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const clientRef = useRef<Client | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (clientRef.current?.active) {
      return;
    }

    const wsUrl = getWsUrl(businessType);
    const topic = getTopic(businessId, businessType);

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: RECONNECT_DELAY,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log(`STOMP conectado a ${businessType}`);
        setIsConnected(true);
        reconnectAttempts.current = 0;

        client.subscribe(topic, (message) => {
          try {
            const parsed: WebSocketMessage = JSON.parse(message.body);
            setLastMessage(parsed);
          } catch (error) {
            console.error('Error parsing STOMP message:', error);
          }
        });
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'], frame.body);
      },

      onWebSocketClose: () => {
        console.log('WebSocket cerrado');
        setIsConnected(false);
        reconnectAttempts.current++;

        if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          console.warn('Máximo de intentos de reconexión alcanzado');
          client.deactivate();
        }
      },

      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [businessId, businessType]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (clientRef.current?.active) {
      const destination = businessType === 'GASTRONOMIA'
        ? `/app/pedidos/${businessId}`
        : `/app/reservas/${businessId}`;
      clientRef.current.publish({
        destination,
        body: JSON.stringify(message),
      });
    } else {
      console.warn('STOMP no está conectado');
    }
  }, [businessId, businessType]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    setTimeout(() => connect(), 100);
  }, [connect, disconnect]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [businessId, businessType]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect,
  };
}
