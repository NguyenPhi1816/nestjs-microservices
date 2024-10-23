import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.LISTENING_HOST,
        port: Number.parseInt(process.env.LISTENING_PORT) || 8084,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = errors
          .map((item) => Object.values(item.constraints).join(', '))
          .join(', ');
        return new RpcException(new BadRequestException(errorMessages));
      },
    }),
  );

  await app.listen();
}
bootstrap();
