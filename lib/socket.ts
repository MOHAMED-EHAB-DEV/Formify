'use server';

/**
 * Server action to broadcast real-time events to the socket server (/formify namespace).
 * @param formId Form unique ID
 * @param event Event name (e.g. 'new_response', 'status_changed', 'form_updated')
 * @param payload Event payload data
 */
export async function broadcastSocketEvent(
  formId: string,
  event: string,
  payload: unknown
): Promise<{ success: boolean; error?: string }> {
  const socketUrl = process.env.MY_STORE_SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_URL;
  if (!socketUrl) {
    return { success: false, error: 'Socket URL not configured' };
  }

  const baseUrl = socketUrl.replace(/\/$/, '');
  const endpoint = `${baseUrl}/api/formify/broadcast`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MY_STORE_SECRET || ''}`,
      },
      body: JSON.stringify({
        room: `form_${formId}`,
        event,
        payload,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Socket Action] Broadcast to ${endpoint} returned status ${res.status}`);
      return { success: false, error: `Broadcast failed with status ${res.status}` };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown broadcast error';
    console.warn('[Socket Action] Broadcast failed:', message);
    return { success: false, error: message };
  }
}
