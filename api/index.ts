import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: NestExpressApplication | null = null;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS for XR development
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Serve static files for Babylon.js XR frontend
    app.useStaticAssets(join(__dirname, '..', 'public'));

    await app.init();
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const server = await bootstrap();
  return server.getHttpAdapter().getInstance()(req, res);
}
