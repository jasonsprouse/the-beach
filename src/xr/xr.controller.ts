import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('xr')
export class XrController {
  
  @Get()
  getXrEnvironment(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }
  
  @Get('demo')
  getXrDemo(@Res() res: Response) {
    // You can create different XR scenes/demos
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
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
        'Cross-platform compatibility'
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
          'Beach umbrellas for teleportation'
        ]
      },
      endpoints: {
        xr: '/xr - Main tropical XR environment',
        demo: '/xr/demo - XR demo scene',
        websocket: 'ws://localhost:3000 - Real-time multiplayer'
      },
      requirements: {
        browser: 'Chrome/Edge with WebXR support',
        device: 'VR headset (Quest, Vive, etc.) or AR device',
        fallback: 'Mouse/keyboard controls for desktop exploration'
      }
    };
  }
}