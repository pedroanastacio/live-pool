import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule, PrismaService } from '@live-pool/database';
import { PollsModule } from '../polls/polls.module';
import { VotesModule } from '../votes/votes.module';
import { EventsModule } from '../../events/events.module';
import { MessagingModule } from '../../messaging/messaging.module';
import { createAuth } from '../../config/auth/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    EventsModule,
    MessagingModule,
    PollsModule,
    VotesModule,
    AuthModule.forRootAsync({
      inject: [PrismaService],
      useFactory: (prismaService: PrismaService) => ({
        auth: createAuth(prismaService),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
