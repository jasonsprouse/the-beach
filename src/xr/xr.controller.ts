import { Controller, Get, Post, Res, UseGuards, Session, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { AuthGuard } from '../auth/auth.guard';
import { WebAuthnAuthGuard } from '../lit/webauthn-auth.guard';

interface UserSession {
  authenticated?: boolean;
  username?: string;
  authenticatedAt?: Date;
  xrSessions?: Array<{
    startTime: Date;
    sessionId: string;
    duration?: number;
  }>;
}

@Controller('xr')
export class XrController {
  private sessionAnalytics = new Map<string, {
    startTime: Date;
    username?: string;
    authenticated: boolean;
  }>();

  @Get()
  getXrEnvironment(@Res() res: Response) {
    // Allow guest access to the XR environment page
    // Users can view and interact with basic features (soundcloud audio)
    return res.sendFile(join(process.cwd(), 'public', 'xr-environment.html'));
  }

  @Post('load-paradise')
  @UseGuards(WebAuthnAuthGuard)
  loadParadise(
    @Session() session: UserSession,
    @Req() req: Request & { user?: any }
  ) {
    // This endpoint requires WebAuthn authentication
    // Only users with verified PKP credentials can load the full paradise scene
    const sessionId = `xr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🎮 Paradise access granted for WebAuthn user: ${req.user?.username}`);
    
    // Track XR session with enhanced PKP info
    this.sessionAnalytics.set(sessionId, {
      startTime: new Date(),
      username: session.username,
      authenticated: !!session.authenticated,
    });

    // Add session to user's XR history
    if (!session.xrSessions) {
      session.xrSessions = [];
    }
    session.xrSessions.push({
      startTime: new Date(),
      sessionId,
    });

    return {
      success: true,
      message: 'Paradise loading authorized for WebAuthn user',
      authenticated: true,
      webAuthnVerified: true,
      sessionId,
      user: {
        username: session.username,
        authenticatedAt: session.authenticatedAt,
        sessionAge: req.user?.sessionAge
      },
      pkpManagement: {
        canMintPKPs: true,
        aiBuildPaths: `/lit/pkp/ai-builds`,
        dashboard: `/lit/pkp/dashboard`
      },
      username: session.username,
    };
  }

  @Post('session/end')
  @UseGuards(AuthGuard)
  endXrSession(@Session() session: UserSession) {
    // Find and update the latest session
    if (session.xrSessions && session.xrSessions.length > 0) {
      const latestSession = session.xrSessions[session.xrSessions.length - 1];
      if (!latestSession.duration) {
        latestSession.duration = Date.now() - latestSession.startTime.getTime();
      }

      // Update analytics
      const analyticsEntry = this.sessionAnalytics.get(latestSession.sessionId);
      if (analyticsEntry) {
        this.sessionAnalytics.delete(latestSession.sessionId);
      }
    }

    return {
      success: true,
      message: 'XR session ended',
    };
  }

  @Get('analytics')
  @UseGuards(AuthGuard)
  getXrAnalytics(@Session() session: UserSession) {
    const userSessions = session.xrSessions || [];
    const totalSessions = userSessions.length;
    const totalDuration = userSessions
      .filter(s => s.duration)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    return {
      username: session.username,
      totalSessions,
      totalDurationMs: totalDuration,
      averageSessionMs: totalSessions > 0 ? totalDuration / totalSessions : 0,
      recentSessions: userSessions.slice(-5), // Last 5 sessions
      currentActiveSessions: Array.from(this.sessionAnalytics.entries())
        .filter(([_, data]) => data.username === session.username)
        .length,
    };
  }

  @Get('demo')
  getXrDemo(@Res() res: Response) {
    // You can create different XR scenes/demos
    return res.sendFile(join(process.cwd(), 'public', 'xr-environment.html'));
  }

  @Get('info')
  getXrInfo() {
    return {
      message: 'Tropical XR Paradise - Babylon.js Environment',
      features: [
        'WebXR VR/AR Support',
        'Tropical Beach Environment',
        'Animated Ocean Waves',
        'Swaying Palm Trees',
        'Multiplayer via Socket.IO',
        'Beach Umbrellas as Teleportation Points',
        'Floating Boats & Beach Decorations',
        'Dynamic Weather & Lighting',
        'Hand Tracking (if supported)',
        'Cross-platform compatibility',
      ],
      environment: {
        theme: 'Tropical Paradise',
        elements: [
          'Sandy beach with seashells',
          'Animated ocean with waves',
          'Palm trees with coconuts',
          'Floating sailboats',
          'Beach balls and decorations',
          'Gradient tropical sky with clouds',
          'Beach umbrellas for teleportation',
        ],
      },
      endpoints: {
        xr: '/xr - Main tropical XR environment',
        demo: '/xr/demo - XR demo scene',
        websocket: 'ws://localhost:3000 - Real-time multiplayer',
      },
      requirements: {
        browser: 'Chrome/Edge with WebXR support',
        device: 'VR headset (Quest, Vive, etc.) or AR device',
        fallback: 'Mouse/keyboard controls for desktop exploration',
      },
    };
  }
}
