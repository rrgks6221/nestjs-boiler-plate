import { NestFactory } from '@nestjs/core';

import { AppModule } from 'src/app.module';
import { setCookie, setCors, setGlobalExceptionFilter } from 'src/bootstrap';
import { SwaggerConfig } from 'src/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setCookie(app);
  setCors(app);
  setGlobalExceptionFilter(app);
  SwaggerConfig.setup(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
