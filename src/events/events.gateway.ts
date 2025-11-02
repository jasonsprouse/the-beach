import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common'; // Import Logger

// --- Interfaces for Payload Typing ---
interface JoinRoomPayload {
  room: string; // The room name the user wants to join
}

interface SignalPayload {
  to: string; // Target user ID (socket.id)
  offer?: RTCSessionDescriptionInit; // WebRTC Offer
  answer?: RTCSessionDescriptionInit; // WebRTC Answer
  candidate?: RTCIceCandidateInit; // WebRTC ICE Candidate
}

interface MovePayload {
  userId: string; // Sender's ID (should match socket.id)
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
}

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for simplicity (adjust for production)
    methods: ['GET', 'POST'],
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Use NestJS Logger for better logging
  private logger: Logger = new Logger('EventsGateway');

  // Store room information: Map<roomId, Set<userId>>
  private rooms = new Map<string, Set<string>>();
  // Store user-to-room mapping: Map<userId, roomId>
  private userToRoom = new Map<string, string>();

  // --- Connection / Disconnection Handlers ---

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    // Optional: Send initial state or welcome message
    // client.emit('welcome', { userId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const roomId = this.userToRoom.get(client.id);

    if (roomId) {
      const roomUsers = this.rooms.get(roomId);
      if (roomUsers) {
        roomUsers.delete(client.id);
        // If room is empty, delete the room entry
        if (roomUsers.size === 0) {
          this.rooms.delete(roomId);
          this.logger.log(`Room empty, removed: ${roomId}`);
        } else {
          // Notify remaining users in the room
          client.to(roomId).emit('user-disconnected', client.id);
          this.logger.log(
            `Notified room ${roomId} about user ${client.id} disconnecting`,
          );
        }
      }
      this.userToRoom.delete(client.id);
    }
  }

  // --- Custom Event Handlers ---

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload | string, // Allow string for simple room name
  ): void {
    const room = typeof payload === 'string' ? payload : payload?.room;

    if (!room) {
      this.logger.warn(
        `Client ${client.id} tried to join without specifying a room.`,
      );
      return;
    }

    // Leave previous room if any
    const previousRoom = this.userToRoom.get(client.id);
    if (previousRoom && previousRoom !== room) {
      client.leave(previousRoom);
      const roomUsers = this.rooms.get(previousRoom);
      if (roomUsers) {
        roomUsers.delete(client.id);
        // Notify remaining users in the old room
        client.to(previousRoom).emit('user-disconnected', client.id);
        if (roomUsers.size === 0) {
          this.rooms.delete(previousRoom);
          this.logger.log(`Room empty, removed: ${previousRoom}`);
        }
      }
      this.logger.log(`Client ${client.id} left room: ${previousRoom}`);
    }

    // Join the new room
    client.join(room);
    this.userToRoom.set(client.id, room);

    // Add user to room set
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set<string>());
    }
    this.rooms.get(room)?.add(client.id);

    this.logger.log(`Client ${client.id} joined room: ${room}`);

    // Notify the client they joined
    client.emit('joined-room', room);

    // Notify others in the room that a new user joined
    // The joining client will initiate offers to existing users
    client.to(room).emit('user-joined', client.id);
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SignalPayload,
  ): void {
    if (!payload || !payload.to || !payload.offer) {
      this.logger.warn(`Invalid offer payload from ${client.id}`);
      return;
    }
    this.logger.log(`Relaying offer from ${client.id} to ${payload.to}`);
    // Emit directly to the target client's socket ID
    this.server.to(payload.to).emit('offer', {
      from: client.id, // Let the receiver know who sent the offer
      offer: payload.offer,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SignalPayload,
  ): void {
    if (!payload || !payload.to || !payload.answer) {
      this.logger.warn(`Invalid answer payload from ${client.id}`);
      return;
    }
    this.logger.log(`Relaying answer from ${client.id} to ${payload.to}`);
    this.server.to(payload.to).emit('answer', {
      from: client.id,
      answer: payload.answer,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SignalPayload,
  ): void {
    if (!payload || !payload.to || !payload.candidate) {
      this.logger.warn(`Invalid ice-candidate payload from ${client.id}`);
      return;
    }
    // this.logger.log(`Relaying ICE candidate from ${client.id} to ${payload.to}`); // Can be very verbose
    this.server.to(payload.to).emit('ice-candidate', {
      from: client.id,
      candidate: payload.candidate,
    });
  }

  @SubscribeMessage('move')
  handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MovePayload,
  ): void {
    const roomId = this.userToRoom.get(client.id);
    if (roomId && payload) {
      // Broadcast movement to everyone else in the room
      client.to(roomId).emit('move', {
        userId: client.id, // Ensure sender ID is correct
        position: payload.position,
        rotation: payload.rotation,
      });
      // No need to log every move event, usually too noisy
    } else if (!roomId) {
      this.logger.warn(
        `Client ${client.id} sent move event but is not in a room.`,
      );
    }
  }
}
