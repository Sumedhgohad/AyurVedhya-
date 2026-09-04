import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisConsumerService implements OnModuleInit {
  private readonly logger = new Logger(RedisConsumerService.name);
  private readonly streamKey = 'stream:aiia:events';
  private readonly groupName = 'group:aiia_workers';
  private readonly consumerName = `worker_${process.pid}`;
  private isRunning = true;

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    await this.initConsumerGroup();
    // Start background asynchronous consumer loop
    this.startConsumerLoop();
  }

  private async initConsumerGroup() {
    const client = this.redisService.getClient();
    try {
      await (client as any).xgroup('CREATE', this.streamKey, this.groupName, '$', 'MKSTREAM');
      this.logger.log(`✅ Redis Consumer Group '${this.groupName}' initialized.`);
    } catch (err: any) {
      if (err.message.includes('BUSYGROUP')) {
        this.logger.log(`ℹ️ Redis Consumer Group '${this.groupName}' already exists.`);
      } else {
        this.logger.error(`Error initializing consumer group: ${err.message}`);
      }
    }
  }

  private async startConsumerLoop() {
    const client = this.redisService.getClient();

    while (this.isRunning) {
      try {
        // Read new messages with XREADGROUP (Blocking for 2 seconds)
        const response: any = await (client as any).xreadgroup(
          'GROUP', this.groupName, this.consumerName,
          'BLOCK', 2000,
          'COUNT', 5,
          'STREAMS', this.streamKey, '>',
        );

        if (response && response.length > 0) {
          for (const [stream, messages] of response) {
            for (const [messageId, fields] of messages) {
              await this.processEvent(messageId, fields);
              // Send XACK to confirm event was successfully processed
              await client.xack(this.streamKey, this.groupName, messageId);
            }
          }
        }
      } catch (err: any) {
        this.logger.error(`Error in Redis Consumer worker loop: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  private async processEvent(messageId: string, fields: string[]) {
    // Parse key-value pairs from Redis Stream message
    const eventData: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      eventData[fields[i]] = fields[i + 1];
    }

    this.logger.log(`📥 [ASYNC WORKER] Processed Event ID: ${messageId} | Type: ${eventData.eventType}`);
  }
}
