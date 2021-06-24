import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './common/swagger';
import { customValidationPipe } from './common/validation-pipe';
import { ApiErrorFilter } from './common/filters/exception.filter';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupSwagger(app);
  customValidationPipe(app)
  app.useGlobalFilters(new ApiErrorFilter());
  app.useStaticAssets(path.join(__dirname, '..', 'public/'));
  app.enableCors();
  await app.listen(process.env.APP_PORT);
}
bootstrap();
