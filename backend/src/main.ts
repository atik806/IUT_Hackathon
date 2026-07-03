import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  try {
    await app.listen(env.port);
    console.log(`Server running on http://localhost:${env.port}`);
  } catch (error) {
    console.error(`Failed to listen on port ${env.port}: ${(error as Error).message}. Bot will continue running.`);
  }
}
bootstrap();
