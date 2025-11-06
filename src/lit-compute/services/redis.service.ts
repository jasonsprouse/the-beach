import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Redis Service for Lit Compute Network
 * 
 * Manages distributed state across Y8 App and The Beach:
 * - User sessions (shared with Y8 App)
 * - Job queue (pending, active, completed)
 * - Node registry (status, heartbeats, capacity)
 * - Real-time pub/sub channels
 */
@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;
  private subscriber: Redis; // Separate client for pub/sub

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL;
    
    if (!redisUrl) {
      this.logger.warn('⚠️  Redis URL not configured. Using in-memory fallback for development.');
      return;
    }

    try {
      this.redis = new Redis(redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.subscriber = new Redis(redisUrl);

      this.redis.on('connect', () => {
        this.logger.log('✅ Connected to Redis');
      });

      this.redis.on('error', (error) => {
        this.logger.error('❌ Redis connection error:', error);
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
    }
  }

  // ==================== Session Management ====================

  /**
   * Set user session (shared with Y8 App)
   */
  async setSession(userId: string, data: any): Promise<void> {
    const key = `session:${userId}`;
    await this.redis.hset(key, data);
    await this.redis.expire(key, 86400); // 24 hours
    this.logger.debug(`Session set for user: ${userId}`);
  }

  /**
   * Get user session
   */
  async getSession(userId: string): Promise<any> {
    const key = `session:${userId}`;
    return await this.redis.hgetall(key);
  }

  /**
   * Delete user session
   */
  async deleteSession(userId: string): Promise<void> {
    const key = `session:${userId}`;
    await this.redis.del(key);
    this.logger.debug(`Session deleted for user: ${userId}`);
  }

  // ==================== Job Queue Management ====================

  /**
   * Add job to pending queue (sorted by timestamp)
   */
  async enqueueJob(job: any): Promise<void> {
    const score = Date.now(); // Use timestamp as priority
    await this.redis.zadd('jobs:pending', score, JSON.stringify(job));
    this.logger.log(`Job enqueued: ${job.id}`);

    // Publish event for real-time updates
    await this.publishEvent('job:created', { jobId: job.id, status: 'pending' });
  }

  /**
   * Get next pending job (FIFO)
   */
  async dequeueJob(): Promise<any | null> {
    const result = await this.redis.zpopmin('jobs:pending', 1);
    if (result && result.length > 0) {
      const jobData = result[0];
      return JSON.parse(jobData);
    }
    return null;
  }

  /**
   * Get all pending jobs
   */
  async getPendingJobs(limit = 100): Promise<any[]> {
    const results = await this.redis.zrange('jobs:pending', 0, limit - 1);
    return results.map((job) => JSON.parse(job));
  }

  /**
   * Assign job to node
   */
  async assignJobToNode(jobId: string, nodeId: string): Promise<void> {
    await this.redis.sadd(`jobs:active:${nodeId}`, jobId);
    await this.redis.hset(`job:${jobId}:status`, {
      status: 'active',
      nodeId,
      startedAt: Date.now(),
    });

    this.logger.log(`Job ${jobId} assigned to node ${nodeId}`);

    // Publish assignment event
    await this.publishJobUpdate(jobId, {
      status: 'active',
      nodeId,
      timestamp: Date.now(),
    });
  }

  /**
   * Mark job as completed
   */
  async completeJob(jobId: string, outputCID: string): Promise<void> {
    const jobStatus = await this.redis.hgetall(`job:${jobId}:status`);
    const nodeId = jobStatus.nodeId;

    // Remove from active jobs
    await this.redis.srem(`jobs:active:${nodeId}`, jobId);

    // Update job status
    await this.redis.hset(`job:${jobId}:status`, {
      status: 'completed',
      outputCID,
      completedAt: Date.now(),
    });

    // Add to completed set with TTL (7 days)
    await this.redis.zadd('jobs:completed', Date.now(), jobId);
    await this.redis.expire('jobs:completed', 604800); // 7 days

    this.logger.log(`Job ${jobId} completed by node ${nodeId}`);

    // Publish completion event
    await this.publishJobUpdate(jobId, {
      status: 'completed',
      outputCID,
      timestamp: Date.now(),
    });
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    return await this.redis.hgetall(`job:${jobId}:status`);
  }

  /**
   * Get jobs assigned to a node
   */
  async getNodeJobs(nodeId: string): Promise<string[]> {
    return await this.redis.smembers(`jobs:active:${nodeId}`);
  }

  // ==================== Node Registry ====================

  /**
   * Register node heartbeat
   */
  async registerNodeHeartbeat(
    nodeId: string,
    data: {
      capacity: number;
      walletAddress: string;
      reputation?: number;
    },
  ): Promise<void> {
    const key = `nodes:${nodeId}:status`;
    await this.redis.hset(key, {
      lastHeartbeat: Date.now(),
      capacity: data.capacity,
      walletAddress: data.walletAddress,
      reputation: data.reputation || 0,
      status: 'online',
    });

    // TTL: 5 minutes (node must send heartbeat every 5 min)
    await this.redis.expire(key, 300);

    // Add to available nodes set
    await this.redis.sadd('nodes:available', nodeId);

    this.logger.debug(`Heartbeat received from node: ${nodeId}`);
  }

  /**
   * Get node status
   */
  async getNodeStatus(nodeId: string): Promise<any> {
    return await this.redis.hgetall(`nodes:${nodeId}:status`);
  }

  /**
   * Get all available nodes
   */
  async getAvailableNodes(): Promise<string[]> {
    return await this.redis.smembers('nodes:available');
  }

  /**
   * Remove offline nodes (TTL expired)
   */
  async removeOfflineNode(nodeId: string): Promise<void> {
    await this.redis.srem('nodes:available', nodeId);
    await this.redis.del(`nodes:${nodeId}:status`);
    this.logger.warn(`Node ${nodeId} removed (offline)`);
  }

  // ==================== Payment Queue ====================

  /**
   * Add pending payment
   */
  async addPendingPayment(
    nodeId: string,
    payment: { jobId: string; amount: string },
  ): Promise<void> {
    const key = `payments:pending:${nodeId}`;
    await this.redis.rpush(key, JSON.stringify(payment));
    this.logger.debug(`Payment pending for node ${nodeId}: ${payment.amount}`);
  }

  /**
   * Get pending payments for node
   */
  async getPendingPayments(nodeId: string): Promise<any[]> {
    const key = `payments:pending:${nodeId}`;
    const payments = await this.redis.lrange(key, 0, -1);
    return payments.map((p) => JSON.parse(p));
  }

  /**
   * Clear pending payments (after processing)
   */
  async clearPendingPayments(nodeId: string): Promise<void> {
    const key = `payments:pending:${nodeId}`;
    await this.redis.del(key);
  }

  // ==================== Pub/Sub for Real-time Updates ====================

  /**
   * Publish job update to WebSocket clients
   */
  async publishJobUpdate(jobId: string, update: any): Promise<void> {
    const channel = `channel:job:${jobId}:updates`;
    await this.redis.publish(channel, JSON.stringify(update));
  }

  /**
   * Publish command to specific node
   */
  async publishNodeCommand(nodeId: string, command: any): Promise<void> {
    const channel = `channel:node:${nodeId}:commands`;
    await this.redis.publish(channel, JSON.stringify(command));
  }

  /**
   * Publish global event
   */
  async publishEvent(eventType: string, data: any): Promise<void> {
    const channel = 'channel:global:events';
    await this.redis.publish(
      channel,
      JSON.stringify({ type: eventType, data, timestamp: Date.now() }),
    );
  }

  /**
   * Subscribe to channel (for WebSocket gateway)
   */
  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(message);
      }
    });
  }

  // ==================== Health Check ====================

  /**
   * Check Redis connection health
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Get Redis stats
   */
  async getStats(): Promise<any> {
    const [pendingCount, activeNodes, completedCount] = await Promise.all([
      this.redis.zcard('jobs:pending'),
      this.redis.scard('nodes:available'),
      this.redis.zcard('jobs:completed'),
    ]);

    return {
      pendingJobs: pendingCount,
      activeNodes,
      completedJobs: completedCount,
      timestamp: Date.now(),
    };
  }
}
