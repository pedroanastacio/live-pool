import {
  Module,
  Global,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { AmqpClient, Producer } from '@live-pool/messaging';

export const PRODUCER_TOKEN = 'MESSAGING_PRODUCER';

@Global()
@Module({
  providers: [
    AmqpClient,
    {
      provide: PRODUCER_TOKEN,
      useFactory: (amqpClient: AmqpClient) => new Producer(amqpClient),
      inject: [AmqpClient],
    },
  ],
  exports: [PRODUCER_TOKEN],
})
export class MessagingModule implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(PRODUCER_TOKEN) private producer: Producer) {}

  async onModuleInit() {
    await this.producer.connect(process.env.RABBITMQ_URL ?? '');
    console.log('Messaging Producer connected to RabbitMQ');
  }

  async onModuleDestroy() {
    await this.producer.close();
    console.log('Messaging Producer disconnected');
  }
}
