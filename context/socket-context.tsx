'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  emitEvent: (event: string, data: unknown) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  emitEvent: () => {},
});

function scheduleNonBlocking(task: () => void) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(() => task());
  } else {
    setTimeout(task, 0);
  }
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!baseUrl) return;

    const socketUrl = baseUrl.endsWith('/formify')
      ? baseUrl
      : `${baseUrl.replace(/\/$/, '')}/formify`;

    let socketInstance: Socket | null = null;

    scheduleNonBlocking(() => {
      try {
        socketInstance = io(socketUrl, {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ['websocket', 'polling'],
          autoConnect: true,
        });

        socketRef.current = socketInstance;

        socketInstance.on('connect', () => {
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          setIsConnected(false);
        });
      } catch (e) {
        console.error('Socket connection error:', e);
      }
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const joinRoom = useCallback((room: string) => {
    scheduleNonBlocking(() => {
      if (socketRef.current && socketRef.current.connected) {
        const formId = room.replace(/^form[-_]/, '');
        socketRef.current.emit('join_form', { formId });
        socketRef.current.emit('join-form', formId);
      }
    });
  }, []);

  const leaveRoom = useCallback((room: string) => {
    scheduleNonBlocking(() => {
      if (socketRef.current && socketRef.current.connected) {
        const formId = room.replace(/^form[-_]/, '');
        socketRef.current.emit('leave_form', { formId });
        socketRef.current.emit('leave-form', formId);
      }
    });
  }, []);

  const emitEvent = useCallback((event: string, data: unknown) => {
    scheduleNonBlocking(() => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit(event, data);
      }
    });
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        joinRoom,
        leaveRoom,
        emitEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
