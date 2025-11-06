import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import session = require('express-session');
import { createClient } from '@vercel/kv';
import { RedisStore } from 'connect-redis';

// Import AppModule - in Vercel, this resolves to the built dist folder
// Vercel's build process makes the dist folder available for serverless functions
import { AppModule } from '../dist/app.module';

let app: NestExpressApplication | null = null;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Configure session store - REQUIRED for Vercel
    let sessionStore;
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      console.log('🔧 Configuring Vercel KV session store...');
      const redisClient = createClient({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      });
      
      sessionStore = new RedisStore({
        client: redisClient as any,
        prefix: 'sess:',
        ttl: 24 * 60 * 60,
      });
      console.log('✅ Vercel KV session store configured');
    } else {
      console.warn('⚠️ WARNING: No KV store configured - sessions will NOT persist!');
      console.warn('⚠️ WebAuthn registration/login will FAIL without persistent sessions');
    }

    // Configure sessions with strict settings for production
    app.use(
      session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        name: 'beach.sid', // Custom session cookie name
        proxy: true, // Trust Vercel proxy
        cookie: {
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          httpOnly: true,
          secure: true, // Always true on Vercel (HTTPS)
          sameSite: 'none', // Required for cross-origin requests
          domain: undefined, // Let Vercel handle domain
        },
      }),
    );

    // Add comprehensive security and permissions headers
    app.use((req, res, next) => {
      // WebAuthn permissions
      res.setHeader('Permissions-Policy', 
        'publickey-credentials-create=*, publickey-credentials-get=*'
      );
      
      // CORS headers
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie'
      );
      res.setHeader('Access-Control-Allow-Methods', 
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      
      next();
    });

    // Enable CORS for XR development
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Serve static files for Babylon.js XR frontend
    // In Vercel's serverless environment, public folder is accessible at the project root
    const publicPath = join(process.cwd(), 'public');
    app.useStaticAssets(publicPath);

    await app.init();
  }
  return app;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const server = await bootstrap();
  return server.getHttpAdapter().getInstance()(req, res);
}
