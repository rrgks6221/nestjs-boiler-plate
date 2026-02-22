import { NestFactory } from '@nestjs/core';

import { AppModule } from 'src/app.module';
import {
  setCookie,
  setCors,
  setGlobalExceptionFilter,
  setGlobalPipe,
  setLogger,
} from 'src/bootstrap';
import { SwaggerConfig } from 'src/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  setCookie(app);
  setCors(app);
  setGlobalExceptionFilter(app);
  setGlobalPipe(app);
  setLogger(app);
  SwaggerConfig.setup(app);
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
