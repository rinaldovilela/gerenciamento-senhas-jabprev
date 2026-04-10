import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(url: string, options?: any) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    socketRef.current = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      ...options,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current.on('error', (err) => {
      setError(err);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [url]);

  return {
    socket: socketRef.current,
    connected,
    error,
    emit: (event: string, data?: any) => socketRef.current?.emit(event, data),
    on: (event: string, handler: (...args: any[]) => void) => {
      socketRef.current?.on(event, handler);
    },
    off: (event: string, handler: (...args: any[]) => void) => {
      socketRef.current?.off(event, handler);
    },
  };
}
