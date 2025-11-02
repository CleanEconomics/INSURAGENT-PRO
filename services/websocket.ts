// WebSocket Service for Real-time Updates

import { io, Socket } from 'socket.io-client';
import { config } from './api/config';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(userId: string) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(config.wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.socket?.emit('authenticate', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('WebSocket disconnected manually');
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Notification events
    this.socket.on('notification:new', (data) => {
      this.emit('notification:new', data);
    });

    // Lead events
    this.socket.on('lead:updated', (data) => {
      this.emit('lead:updated', data);
    });

    // Opportunity events
    this.socket.on('opportunity:updated', (data) => {
      this.emit('opportunity:updated', data);
    });

    // Ticket events
    this.socket.on('ticket:updated', (data) => {
      this.emit('ticket:updated', data);
    });

    // Message events
    this.socket.on('message:incoming', (data) => {
      this.emit('message:incoming', data);
    });

    // Task events
    this.socket.on('task:updated', (data) => {
      this.emit('task:updated', data);
    });

    // Appointment events
    this.socket.on('appointment:created', (data) => {
      this.emit('appointment:created', data);
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }
}

export const wsService = new WebSocketService();
