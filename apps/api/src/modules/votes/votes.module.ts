import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';

@Module({
  controllers: [VotesController],
  providers: [],
  exports: [],
})
export class VotesModule {}
