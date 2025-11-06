import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../services/redis.service';

/**
 * Lit Compute WebSocket Gateway
 * 
 * Real-time communication for:
 * - Job status updates
 * - Node commands
 * - System events
 * - Dashboard live updates
 */
@WebSocketGateway({
  namespace: '/lit-compute',
  cors: {
    origin: '*', // Configure for production
    methods: ['GET', 'POST'],
  },
})
export class LitComputeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LitComputeGateway.name);
  private readonly userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>
  private readonly nodeSockets = new Map<string, string>(); // nodeId -> socketId

  constructor(private readonly redisService: RedisService) {
    // Subscribe to Redis pub/sub channels
    this.subscribeToRedisChannels();
  }

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from user sockets
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }

    // Remove from node sockets
    for (const [nodeId, socketId] of this.nodeSockets.entries()) {
      if (socketId === client.id) {
        this.nodeSockets.delete(nodeId);
        this.logger.warn(`Node disconnected: ${nodeId}`);
      }
    }
  }

  /**
   * User subscribes to job updates
   */
  @SubscribeMessage('subscribe:job')
  handleSubscribeJob(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; jobId: string },
  ) {
    const { userId, jobId } = data;

    // Track user socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(client.id);

    // Join job-specific room
    client.join(`job:${jobId}`);

    this.logger.debug(
      `User ${userId} subscribed to job ${jobId} via ${client.id}`,
    );

    return { success: true, jobId };
  }

  /**
   * Node subscribes to commands
   */
  @SubscribeMessage('subscribe:node')
  handleSubscribeNode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { nodeId: string },
  ) {
    const { nodeId } = data;

    // Track node socket
    this.nodeSockets.set(nodeId, client.id);

    // Join node-specific room
    client.join(`node:${nodeId}`);

    this.logger.log(`Node ${nodeId} subscribed via ${client.id}`);

    return { success: true, nodeId };
  }

  /**
   * Unsubscribe from job updates
   */
  @SubscribeMessage('unsubscribe:job')
  handleUnsubscribeJob(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jobId: string },
  ) {
    const { jobId } = data;
    client.leave(`job:${jobId}`);

    this.logger.debug(`Client ${client.id} unsubscribed from job ${jobId}`);

    return { success: true, jobId };
  }

  /**
   * Subscribe to Redis pub/sub channels and forward to WebSocket clients
   */
  private async subscribeToRedisChannels() {
    try {
      // Subscribe to global events
      await this.redisService.subscribe(
        'channel:global:events',
        (message) => {
          const event = JSON.parse(message);
          this.broadcastEvent(event);
        },
      );

      this.logger.log('Subscribed to Redis pub/sub channels');
    } catch (error) {
      this.logger.error('Failed to subscribe to Redis channels:', error);
    }
  }

  /**
   * Broadcast event to all connected clients
   */
  private broadcastEvent(event: any) {
    this.server.emit('system:event', event);
    this.logger.debug(`Broadcast event: ${event.type}`);
  }

  /**
   * Send job update to subscribed clients
   */
  async sendJobUpdate(jobId: string, update: any) {
    this.server.to(`job:${jobId}`).emit('job:update', {
      jobId,
      ...update,
    });

    this.logger.debug(`Job update sent for ${jobId}: ${update.status}`);
  }

  /**
   * Send command to specific node
   */
  async sendNodeCommand(nodeId: string, command: any) {
    this.server.to(`node:${nodeId}`).emit('node:command', command);

    this.logger.debug(`Command sent to node ${nodeId}: ${command.type}`);
  }

  /**
   * Broadcast system stats to dashboard clients
   */
  async broadcastStats(stats: any) {
    this.server.emit('system:stats', stats);
  }
}
