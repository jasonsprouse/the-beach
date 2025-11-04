import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import session = require('express-session');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure session middleware for WebAuthn
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // Add Permissions Policy headers for WebAuthn support
  app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 
      'publickey-credentials-create=*, publickey-credentials-get=*'
    );
    res.setHeader('Feature-Policy', 
      'publickey-credentials-create *; publickey-credentials-get *'
    );
    res.setHeader('Access-Control-Allow-Headers', 
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    console.log('Setting WebAuthn permissions headers');
    next();
  });

  // Enable CORS for XR development
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Serve static files for Babylon.js XR frontend
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 XR Server running on: http://localhost:${port}`);
}
bootstrap();
