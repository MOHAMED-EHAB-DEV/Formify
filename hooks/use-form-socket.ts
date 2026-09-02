'use client';

import { useEffect, useState, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { FormResponse } from '@/types';

interface UseFormSocketOptions {
  formId: string;
  userEmail?: string;
  userName?: string;
  onNewResponse?: (data: { response: FormResponse; totalResponses: number }) => void;
  onStatusChange?: (status: string) => void;
  onFormUpdate?: (data: { title?: string; description?: string }) => void;
  onActiveViewers?: (data: { formId: string; viewers: unknown[] }) => void;
}

export function useFormSocket({
  formId,
  userEmail,
  userName,
  onNewResponse,
  onStatusChange,
  onFormUpdate,
  onActiveViewers,
}: UseFormSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store callbacks in refs to prevent reconnect loop when inline functions change
  const onNewResponseRef = useRef(onNewResponse);
  const onStatusChangeRef = useRef(onStatusChange);
  const onFormUpdateRef = useRef(onFormUpdate);
  const onActiveViewersRef = useRef(onActiveViewers);

  useEffect(() => {
    onNewResponseRef.current = onNewResponse;
    onStatusChangeRef.current = onStatusChange;
    onFormUpdateRef.current = onFormUpdate;
    onActiveViewersRef.current = onActiveViewers;
  });

  useEffect(() => {
    if (!formId) return;

    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!baseUrl) {
      return;
    }

    // Connect to dedicated /formify namespace on the socket server
    const socketUrl = baseUrl.endsWith('/formify')
      ? baseUrl
      : `${baseUrl.replace(/\/$/, '')}/formify`;

    let socketInstance: Socket | null = null;

    try {
      socketInstance = io(socketUrl, {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        setError(null);
        console.log(`[Socket:Formify] Connected to ${socketUrl}`);

        // Emit join_form to enter room
        socketInstance?.emit('join_form', {
          formId,
          email: userEmail || '',
          user: { email: userEmail || '', name: userName || 'Viewer' },
        });
        socketInstance?.emit('join-form', formId);
      });

      socketInstance.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log(`[Socket:Formify] Disconnected: ${reason}`);
      });

      socketInstance.on('connect_error', (err) => {
        setIsConnected(false);
        setError(err.message);
        console.warn(`[Socket:Formify] Connection error:`, err.message);
      });

      // Handle new response events (both naming conventions)
      const handleNewResponse = (data: {
        formId?: string;
        response?: FormResponse;
        answers?: Array<{ questionId: string; answer: string }>;
        id?: string;
        submittedAt?: string;
        totalResponses?: number;
      }) => {
        console.log('[Socket:Formify] Received new response event:', data);

        let responseObj: FormResponse | null = null;

        if (data.response) {
          responseObj = data.response;
        } else if (data.answers && data.id) {
          responseObj = {
            id: data.id,
            submittedAt: data.submittedAt || new Date().toISOString(),
            answers: data.answers,
          };
        }

        if (responseObj) {
          onNewResponseRef.current?.({
            response: responseObj,
            totalResponses: data.totalResponses || 1,
          });
        }
      };

      socketInstance.on('new_response', handleNewResponse);
      socketInstance.on('new-response', handleNewResponse);

      // Handle status change
      const handleStatusChange = (data: { formId?: string; status: string } | string) => {
        console.log('[Socket:Formify] Status changed:', data);
        const status = typeof data === 'string' ? data : data.status;
        if (status) {
          onStatusChangeRef.current?.(status);
        }
      };
      socketInstance.on('status_changed', handleStatusChange);
      socketInstance.on('status-changed', handleStatusChange);

      // Handle form updates
      const handleFormUpdate = (data: {
        formId?: string;
        data?: { title?: string; description?: string };
        title?: string;
        description?: string;
      }) => {
        console.log('[Socket:Formify] Form updated:', data);
        if (!data.formId || data.formId === formId) {
          const payload = data.data || { title: data.title, description: data.description };
          onFormUpdateRef.current?.(payload);
        }
      };
      socketInstance.on('form_updated', handleFormUpdate);
      socketInstance.on('form-updated', handleFormUpdate);

      // Handle active viewers list
      const handleActiveViewers = (data: { formId: string; viewers: unknown[] }) => {
        onActiveViewersRef.current?.(data);
      };
      socketInstance.on('active_viewers', handleActiveViewers);
    } catch (err) {
      console.error('[Socket:Formify] Initialization error:', err);
    }

    return () => {
      if (socketInstance) {
        socketInstance.emit('leave_form', { formId, email: userEmail });
        socketInstance.emit('leave-form', formId);
        socketInstance.disconnect();
      }
    };
  }, [formId, userEmail, userName]);

  return { isConnected, error };
}
