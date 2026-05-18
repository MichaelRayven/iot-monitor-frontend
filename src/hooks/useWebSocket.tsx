import { useCallback, useEffect, useRef } from "react";

export interface WebSocketOptions<T = unknown> {
  onMessage?: (data: T) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  reconnect?: boolean;
}

export function useWebSocket<IncomingData = unknown, OutgoingData = unknown>(
  url: string,
  options: WebSocketOptions<IncomingData> = {}
) {
  const { onMessage, onOpen, onClose, reconnect = true } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef<number>(0);

  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
  }, [onMessage, onOpen, onClose]);

  const scheduleReconnect = useCallback(() => {
    const attempt = attemptRef.current;
    if (attempt >= 10) return;

    const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30000);
    const jitter = Math.random() * 1000;
    const delay = baseDelay + jitter;

    reconnectTimer.current = setTimeout(() => {
      attemptRef.current += 1;
      connect();
    }, delay);
  }, []);

  const connect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }

    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {
      attemptRef.current = 0;
      onOpenRef.current?.();
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const parsedData = JSON.parse(event.data) as IncomingData;
        onMessageRef.current?.(parsedData);
      } catch (err) {
        console.error("Failed to parse incoming WebSocket message JSON:", err);
      }
    };

    socket.onclose = (event: CloseEvent) => {
      onCloseRef.current?.(event);
      if (reconnect && event.code !== 1000) {
        scheduleReconnect();
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [url, reconnect, scheduleReconnect]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      wsRef.current?.close(1000, "hook cleanup");
    };
  }, [connect]);

  const send = useCallback((data: OutgoingData) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not open. Cannot send message:", data);
    }
  }, []);

  return { send, wsRef };
}
