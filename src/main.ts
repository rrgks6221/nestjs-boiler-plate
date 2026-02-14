import { NestFactory } from '@nestjs/core';

import { AppModule } from 'src/app.module';
import { setCookie, setGlobalExceptionFilter } from 'src/bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setCookie(app);
  setGlobalExceptionFilter(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
