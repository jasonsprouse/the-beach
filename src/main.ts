import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import session = require('express-session');
import { createClient } from '@vercel/kv';
import { RedisStore } from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure session store based on environment
  let sessionStore;
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    // Production: Use Vercel KV (Redis-compatible)
    console.log('🔧 Configuring Vercel KV session store...');
    const redisClient = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    
    sessionStore = new RedisStore({
      client: redisClient as any,
      prefix: 'sess:',
      ttl: 24 * 60 * 60, // 24 hours in seconds
    });
    console.log('✅ Vercel KV session store configured');
  } else {
    // Development: Use in-memory sessions
    console.log('⚠️  Using in-memory session store (development only)');
  }

  // Configure session middleware for WebAuthn
  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
    }),
  );

  // Add comprehensive security and permissions headers
  app.use((req, res, next) => {
    // WebAuthn permissions - Allow all origins for development
    // Format: feature=(origin1 origin2) or feature=* for all
    res.setHeader('Permissions-Policy', 
      'publickey-credentials-create=*, publickey-credentials-get=*'
    );
    res.setHeader('Feature-Policy', 
      'publickey-credentials-create *; publickey-credentials-get *'
    );
    
    // CORS and security headers
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    
    // More permissive Content Security Policy for external CDN scripts
    res.setHeader('Content-Security-Policy',
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://w.soundcloud.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net; " +
      "frame-src 'self' https://w.soundcloud.com; " +
      "media-src 'self' https://*.soundcloud.com; " +
      "connect-src 'self' https://*.soundcloud.com https://cdn.jsdelivr.net;"
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
