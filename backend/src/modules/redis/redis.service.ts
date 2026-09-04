import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  onModuleInit() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
    console.log('✅ Redis Streams Event Bus connected.');
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  // Publish event to Redis Stream (e.g. 'safety.sae_logged', 'study.status_changed')
  async publishEvent(streamKey: string, eventType: string, payload: Record<string, any>) {
    await this.redisClient.xadd(
      streamKey,
      '*',
      'eventType', eventType,
      'payload', JSON.stringify(payload),
      'timestamp', new Date().toISOString(),
    );
  }

  getClient(): Redis {
    return this.redisClient;
  }
}
