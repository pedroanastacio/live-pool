import { PollStatus } from '@live-pool/database';

export class PollOptionResponseDto {
  id: string;
  description: string;
  ordeIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PollResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: PollStatus;
  expiresAt: Date;
  options: PollOptionResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class PollDeleteResponseDto {
  message: string;
}
