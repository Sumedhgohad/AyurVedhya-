import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisConsumerService } from './redis-consumer.service';

@Global()
@Module({
  providers: [RedisService, RedisConsumerService],
  exports: [RedisService],
})
export class RedisModule {}
