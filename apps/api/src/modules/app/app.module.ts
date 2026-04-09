import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule, PrismaService } from '@live-pool/database';
import { PollsModule } from '../polls/polls.module';
import { VotesModule } from '../votes/votes.module';
import { EventsModule } from '../../events/events.module';
import { MessagingModule } from '../../config/messaging/messaging.module';
import { RedisModule } from '../../config/redis/redis.module';
import { RedisService } from '../../config/redis/redis.service';
import { createAuth } from '../../config/auth/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    EventsModule,
    MessagingModule,
    PollsModule,
    VotesModule,
    AuthModule.forRootAsync({
      inject: [PrismaService, RedisService],
      useFactory: (
        prismaService: PrismaService,
        redisService: RedisService,
      ) => ({
        auth: createAuth(prismaService, redisService.client),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
