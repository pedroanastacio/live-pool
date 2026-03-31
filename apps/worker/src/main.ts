import 'dotenv/config';
import { WorkerApp } from './app';

const app = new WorkerApp();

const start = async (): Promise<void> => {
  try {
    await app.start();
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
};

const shutdown = async (): Promise<void> => {
  await app.stop();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

void start();
