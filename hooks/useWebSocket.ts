// Custom hook for WebSocket events

import { useEffect } from 'react';
import { wsService } from '../services/websocket';

export function useWebSocket(
  event: string,
  callback: (data: any) => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    wsService.on(event, callback);

    return () => {
      wsService.off(event, callback);
    };
  }, [event, ...dependencies]);
}

// Specific hooks for common events
export function useNotifications(callback: (notification: any) => void) {
  useWebSocket('notification:new', callback);
}

export function useLeadUpdates(callback: (data: any) => void) {
  useWebSocket('lead:updated', callback);
}

export function useOpportunityUpdates(callback: (data: any) => void) {
  useWebSocket('opportunity:updated', callback);
}

export function useTicketUpdates(callback: (data: any) => void) {
  useWebSocket('ticket:updated', callback);
}

export function useMessageUpdates(callback: (data: any) => void) {
  useWebSocket('message:incoming', callback);
}

export function useTaskUpdates(callback: (data: any) => void) {
  useWebSocket('task:updated', callback);
}

export function useAppointmentUpdates(callback: (data: any) => void) {
  useWebSocket('appointment:created', callback);
}
