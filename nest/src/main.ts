import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origins = (process.env.CORS_ORIGIN ?? '*').split(',').map((o) => o.trim());
  app.enableCors({ origin: origins.includes('*') ? true : origins });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields
      forbidNonWhitelisted: true, // ...and reject requests that send them
      transform: true, // query strings -> typed DTOs
      stopAtFirstError: true, // one clear message per field
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  Logger.log(`API listening on :${port} (today = ${process.env.APP_TODAY ?? '2026-05-15'})`, 'Bootstrap');
}
bootstrap();
