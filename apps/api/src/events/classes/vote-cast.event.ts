import { CreateVoteDto } from 'src/modules/votes/dto';
import { IEvent } from '../types';

export class VoteCastEvent implements IEvent {
  ocurred_at: Date;
  data: CreateVoteDto;

  constructor(data: CreateVoteDto) {
    this.ocurred_at = new Date();
    this.data = data;
  }
}
