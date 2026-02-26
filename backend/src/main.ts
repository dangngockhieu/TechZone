declare const module: any;                              
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { AppExceptionFilter } from './help/filters/app-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const bootstrap = async() =>{
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from 'public' directory
  app.useStaticAssets(join(__dirname, '..', '..', 'public'));
  
  app.use(cookieParser());
  const origins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim());
  app.enableCors({
    origin: origins,     
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));
  app.useGlobalFilters(new AppExceptionFilter());
  await app.listen(process.env.PORT ?? 8080);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
