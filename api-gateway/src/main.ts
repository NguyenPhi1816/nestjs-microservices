import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new RpcExceptionFilter());
  app.enableCors();

  app.useStaticAssets(resolve('./src/public'));
  app.setBaseViewsDir(resolve('./src/views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.LISTENING_PORT);
}
bootstrap();
