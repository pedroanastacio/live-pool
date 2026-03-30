import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@live-pool/database';
import { PollsModule } from '../polls/polls.module';
import { VotesModule } from '../votes/votes.module';
import { EventsModule } from '../../events/events.module';
import { MessagingModule } from '../../messaging/messaging.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
