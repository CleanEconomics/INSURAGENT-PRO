import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function initializeWebSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('authenticate', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} authenticated on socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ WebSocket server initialized');
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Event emitters
export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToAll(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}

export function emitNotification(userId: string, notification: any) {
  emitToUser(userId, 'notification:new', notification);
}

export function emitLeadUpdate(leadId: string, lead: any) {
  emitToAll('lead:updated', { leadId, lead });
}

export function emitOpportunityUpdate(opportunityId: string, opportunity: any) {
  emitToAll('opportunity:updated', { opportunityId, opportunity });
}

export function emitTicketUpdate(ticketId: string, ticket: any) {
  emitToAll('ticket:updated', { ticketId, ticket });
}

export function emitMessage(userId: string, message: any) {
  emitToUser(userId, 'message:incoming', message);
}

export function emitTaskUpdate(taskId: string, task: any) {
  emitToAll('task:updated', { taskId, task });
}

export function emitAppointmentCreated(userId: string, appointment: any) {
  emitToUser(userId, 'appointment:created', appointment);
}
