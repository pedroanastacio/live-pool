import { IEvent } from '../types';

export class VoteCastEvent implements IEvent {
  ocurred_at: Date;
  data: unknown;

  constructor(data: unknown) {
    this.ocurred_at = new Date();
    this.data = data;
  }
}
