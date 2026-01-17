import { useState, useEffect, useRef, useCallback } from 'react';
import type { WebSocketMessage, BusinessType } from '../types';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
const RECONNECT_INTERVAL = 5000; // 5 segundos
const MAX_RECONNECT_ATTEMPTS = 10;

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
}

export function useWebSocket(businessId: string, businessType: BusinessType): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}/business/${businessId}?type=${businessType}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket conectado');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Enviar mensaje de subscripción
        ws.send(JSON.stringify({
          type: 'subscribe',
          businessId,
          businessType
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket cerrado:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Intentar reconectar
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`Intentando reconectar (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})...`);
            connect();
          }, RECONNECT_INTERVAL);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setIsConnected(false);
    }
  }, [businessId, businessType]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket no está conectado');
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [connect, disconnect]);

  // Conectar al montar y desconectar al desmontar
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconectar si cambia el businessId o businessType
  useEffect(() => {
    reconnect();
  }, [businessId, businessType]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect
  };
}

// Hook simplificado que usa polling como fallback si WebSocket no está disponible
export function useWebSocketWithFallback(
  businessId: string,
  businessType: BusinessType,
  onNewData: () => void,
  pollingInterval = 30000
): UseWebSocketReturn {
  const ws = useWebSocket(businessId, businessType);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Si WebSocket no está conectado, usar polling
    if (!ws.isConnected) {
      pollingRef.current = setInterval(() => {
        onNewData();
      }, pollingInterval);
    } else {
      // Si WebSocket está conectado, limpiar polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [ws.isConnected, onNewData, pollingInterval]);

  return ws;
}
