# 🏝️ The Beach - XR Platform for Digital AI Agents & NPEs

<p align="center">
  <strong>A revolutionary WebXR metaverse enabling Non-Person Entities (NPEs) to operate autonomous digital AI agents with cryptographic identity and biometric security</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WebAuthn-Secured-purple.svg" alt="WebAuthn Secured" />
  <img src="https://img.shields.io/badge/Lit_Protocol-7.x-orange.svg" alt="Lit Protocol" />
  <img src="https://img.shields.io/badge/WebXR-Enabled-blue.svg" alt="WebXR Enabled" />
  <img src="https://img.shields.io/badge/Babylon.js-8.x-green.svg" alt="Babylon.js" />
  <img src="https://img.shields.io/badge/NestJS-11.x-red.svg" alt="NestJS" />
  <img src="https://img.shields.io/badge/NPE-Ready-gold.svg" alt="NPE Ready" />
  <img src="https://img.shields.io/badge/Multi--Agent-Enabled-cyan.svg" alt="Multi-Agent" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License" />
</p>

---

## 🤖 Vision: The Future of Digital AI Agents

**The Beach** is more than a tropical metaverse—it's a **platform for Non-Person Entities (NPEs)** to deploy and manage **multiple autonomous digital AI agents** in an immersive XR environment. Each agent operates with its own cryptographic identity (PKP), enabling teams of specialized AI services to collaborate, transact, and serve customers in a persistent virtual space.

### 💡 What are Non-Person Entities (NPEs)?

**NPEs** are organizations, AI systems, or automated services that require cryptographic identity without traditional human biometric authentication. In The Beach:

- **🏢 Businesses** can deploy AI agents to sell complementary services (e.g., virtual tours, digital products, consulting)
- **🤖 AI Systems** operate autonomously with their own wallets and transaction capabilities
- **🔐 Each agent** has a unique PKP (Programmable Key Pair) for secure operations
- **👥 Multi-agent teams** coordinate in shared XR spaces to deliver comprehensive service offerings
- **💼 Revenue generation** through AI-driven commerce and automated transactions

> 💡 **Inspired by Excellence**: [Y8's NPE Manager](https://y8-app.vercel.app/blog/npe-manager-guide) demonstrates the power of NPE management with extensible schemas, tiered business models, and autonomous agent capabilities. The Beach builds on these concepts by adding immersive XR environments, geo-fenced services, and game manager architecture for enterprise-scale deployments.

### NPE Characteristics

Following the [Y8 NPE Manager model](https://y8-app.vercel.app/blog/npe-manager-guide), each NPE in The Beach has:

1. **Unique Cryptographic Identity**: PKP-based authentication for secure operations
2. **Extensible JSON Schema**: Store metadata, configuration, and capabilities
3. **Autonomous Action Capability**: Execute transactions, sign messages, and make decisions
4. **Programmable Behavior**: Define custom logic through Lit Actions
5. **Persistent State**: Maintain context across sessions and interactions

```javascript
// Example NPE Schema (inspired by Y8)
const npeSchema = {
  // Core Identity
  pkpAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  publicKey: "0x04a5...",
  
  // Metadata
  name: "Beach Concierge Agent #1",
  type: "service-provider",
  category: "hospitality",
  
  // Capabilities (extensible)
  capabilities: {
    languages: ["English", "Spanish", "French"],
    services: ["booking", "recommendations", "support"],
    paymentMethods: ["ETH", "USDC", "DAI"],
    operatingHours: "24/7",
    maxConcurrentSessions: 10
  },
  
  // Geographic Configuration
  location: {
    lat: 25.7617,
    lng: -80.1918,
    timezone: "America/New_York",
    serviceRadius: 5000 // meters
  },
  
  // Business Logic
  pricing: {
    model: "per-transaction",
    baseRate: 0.001, // ETH
    commission: 0.15 // 15%
  },
  
  // Performance Metrics
  analytics: {
    totalSessions: 1247,
    successRate: 0.98,
    avgResponseTime: 4.2, // seconds
    customerSatisfaction: 4.7,
    revenue: {
      total: 12.45, // ETH
      thisMonth: 3.21
    }
  },
  
  // Lit Actions Configuration
  litActions: {
    onCustomerRequest: "ipfs://QmCustomerRequestHandler",
    onPaymentReceived: "ipfs://QmPaymentProcessor",
    onEmergency: "ipfs://QmEmergencyProtocol"
  },
  
  // Custom Fields (user-defined)
  customFields: {
    preferredGreeting: "Welcome to paradise!",
    specializations: ["water sports", "beach activities"],
    certifications: ["CPR", "First Aid", "Lifeguard"]
  }
};
```

### NPE Tiers & Business Model

Inspired by [Y8's tiered approach](https://y8-app.vercel.app/blog/npe-manager-guide), The Beach offers flexible NPE deployment options:

#### 🆓 **Freemium Tier** - Free
- **NPE Limit**: 3 agents (ai-build#0, ai-build#1, session#0)
- **Schema Fields**: Up to 5 custom fields per NPE
- **Lit Actions**: Basic access
- **XR Environment**: Limited to 1 location
- **Service Radius**: 1km
- **Perfect For**: 
  - Experimenting with NPE capabilities
  - Personal projects and prototypes
  - Learning agent orchestration
  - Simple automation tasks

#### ⭐ **Base Tier** - $10/month
- **NPE Limit**: 25 agents
- **Schema Fields**: Up to 25 custom fields per NPE
- **Lit Actions**: Full access
- **XR Environment**: Up to 5 locations
- **Service Radius**: 10km
- **GBL Environments**: Access to Global Business Logic
- **Analytics**: Basic performance metrics
- **Perfect For**:
  - Small to medium businesses
  - Decentralized applications (dApps)
  - Multi-agent service teams
  - Local service marketplaces

#### 💎 **Premium Tier** - $50/month
- **NPE Limit**: Unlimited agents
- **Schema Fields**: Unlimited custom fields
- **Lit Actions**: Full access + priority execution
- **XR Environment**: Unlimited locations
- **Service Radius**: Unlimited (global)
- **GBL Environments**: Full access with custom logic
- **Analytics**: Advanced metrics + AI insights
- **XR Networking**: Immersive multi-user experiences
- **Dedicated Support**: Priority assistance
- **API Access**: Full REST/GraphQL API
- **Perfect For**:
  - Enterprise-level applications
  - Large-scale DAOs and metaverses
  - Global service networks
  - Research and development

```javascript
// Tier-based NPE management
class NPETierManager {
  constructor(tier) {
    this.tier = tier; // 'freemium', 'base', 'premium'
    this.limits = this.getTierLimits(tier);
  }
  
  getTierLimits(tier) {
    const limits = {
      freemium: {
        maxNPEs: 3,
        maxSchemaFields: 5,
        maxLocations: 1,
        serviceRadius: 1000,
        litActions: 'basic',
        support: 'community'
      },
      base: {
        maxNPEs: 25,
        maxSchemaFields: 25,
        maxLocations: 5,
        serviceRadius: 10000,
        litActions: 'full',
        support: 'email'
      },
      premium: {
        maxNPEs: Infinity,
        maxSchemaFields: Infinity,
        maxLocations: Infinity,
        serviceRadius: Infinity,
        litActions: 'full-priority',
        support: 'dedicated'
      }
    };
    return limits[tier];
  }
  
  async createNPE(npeConfig) {
    // Check tier limits
    const currentNPECount = await this.getCurrentNPECount();
    if (currentNPECount >= this.limits.maxNPEs) {
      throw new Error(`NPE limit reached for ${this.tier} tier. Upgrade to create more agents.`);
    }
    
    // Validate schema fields
    const fieldCount = Object.keys(npeConfig.customFields || {}).length;
    if (fieldCount > this.limits.maxSchemaFields) {
      throw new Error(`Schema field limit (${this.limits.maxSchemaFields}) exceeded. Upgrade to add more fields.`);
    }
    
    // Create NPE with tier restrictions
    const npe = await this.mintNPE({
      ...npeConfig,
      tier: this.tier,
      limits: this.limits
    });
    
    console.log(`✅ NPE created: ${npe.name} (${this.tier} tier)`);
    return npe;
  }
  
  async upgrade(newTier) {
    console.log(`⬆️ Upgrading from ${this.tier} to ${newTier}`);
    this.tier = newTier;
    this.limits = this.getTierLimits(newTier);
    
    // Unlock additional features
    await this.unlockTierFeatures(newTier);
  }
}

// Example usage
const freemiumManager = new NPETierManager('freemium');
const npe1 = await freemiumManager.createNPE({ name: 'Test Agent' }); // ✅
const npe2 = await freemiumManager.createNPE({ name: 'Test Agent 2' }); // ✅
const npe3 = await freemiumManager.createNPE({ name: 'Test Agent 3' }); // ✅
// const npe4 = await freemiumManager.createNPE({ name: 'Test Agent 4' }); // ❌ Limit reached

// Upgrade to unlock more NPEs
await freemiumManager.upgrade('base');
const npe4 = await freemiumManager.createNPE({ name: 'Test Agent 4' }); // ✅ Now allowed
```

---

## 🎯 Core Use Cases

### 1. **Multi-Agent Service Marketplace** 🛍️
Deploy **multiple AI agents** simultaneously, each offering complementary services:
- **Agent A**: Virtual tour guide for real estate in tropical locations
- **Agent B**: Financial advisor for vacation property investments  
- **Agent C**: Travel booking assistant for flights and accommodations
- **Agent D**: Local experience curator (restaurants, activities, culture)

All agents share a unified XR environment, creating a **comprehensive customer experience** where users can engage with specialized services in one seamless session.

### 2. **NPE-Controlled Digital Storefronts** 🏪
Organizations can establish **persistent AI-staffed locations**:
- **24/7 availability** - AI agents never sleep
- **Sub-PKP management** - Each product line or service has dedicated PKPs
- **Automated transactions** - PKPs handle payments and smart contracts
- **Multi-language support** - AI agents communicate in customer's preferred language
- **Scalable operations** - Spin up additional agents during peak demand

### 3. **Collaborative AI Workspaces** 🤝
Teams of AI agents work together on complex tasks:
- **Development agents** (ai-build#0, ai-build#1) collaborate on code generation
- **Session management agents** (session#0) handle user state and persistence
- **Specialized sub-PKPs** for different roles (research, analysis, execution, validation)
- **Real-time coordination** through WebXR multiplayer infrastructure
- **Shared context** in immersive 3D environment

### 4. **Biometric-Secured AI Agent Management** 🔐
Human operators manage NPE agents with military-grade security:
- **WebAuthn biometric authentication** (fingerprint, face, security key)
- **1:1 PKP mapping** ensures identity consistency
- **Hierarchical PKP structure**: Master PKP → Sub-PKPs for each agent
- **Session-based control** with automatic security timeouts
- **Audit trails** for all NPE operations and transactions

---

## 🚀 Revolutionary Features

### 🤖 **Multi-Agent NPE Platform**
- **🎭 Multiple Simultaneous Agents**: Deploy unlimited AI agents, each with unique PKP identity
- **🔗 Hierarchical PKP Architecture**: Primary PKP spawns sub-PKPs for specialized agents
- **💰 Agent-Level Wallets**: Each sub-PKP enables independent transactions and payments
- **🎯 Purpose-Specific Agents**: Dedicated PKPs for ai-builds, sessions, experiments
- **🌐 Persistent Presence**: NPE agents remain active 24/7 in XR environment
- **📊 Agent Analytics**: Track performance, interactions, and revenue per agent
- **🔄 Dynamic Scaling**: Spin up/down agents based on demand

### 🏢 **NPE Identity & Authentication**
- **🔑 WebAuthn for Operators**: Human managers use biometric auth to control NPE systems
- **⚡ PKP for Agents**: Each AI agent operates with cryptographic identity (no passwords)
- **🛡️ 1:1 PKP Mapping**: Revolutionary deterministic PKP generation ensures consistency
- **🔐 Sub-PKP Minting**: Create unlimited specialized identities for different agent roles
- **💾 Session Management**: Secure 24-hour authentication windows with automatic rotation
- **🎫 Role-Based Access**: Operators, supervisors, and agents have distinct permission levels

### 🌐 **Immersive XR Service Environments**
- **🏝️ Tropical Metaverse**: Beautiful beach setting for pleasant customer interactions
- **🥽 WebXR Compatible**: Full VR/AR support (Meta Quest, PICO, HTC Vive, WebXR devices)
- **👥 Multiplayer Ready**: Multiple AI agents and human customers share space simultaneously
- **📹 Video/Audio Chat**: WebRTC integration for human-AI interaction
- **🎨 Customizable Environments**: Brand your NPE space with logos, colors, products
- **🌊 Realistic Physics**: Ocean waves, atmospheric effects, spatial audio

---

## 🎯 Quick Start for NPE Deployment

### Prerequisites
- **Node.js** 18.0.0+ (recommended: 20.x)
- **npm** or **yarn**
- **WebAuthn-compatible device** (laptop with fingerprint reader, smartphone, security key)
- **WebXR device** (optional, for immersive experience)

### Installation

```bash
# Clone the repository
git clone https://github.com/jasonsprouse/the-beach.git
cd the-beach

# Install dependencies
npm install

# Start development server
npm run start:dev

# Open browser
open http://localhost:3000
```

### Setting Up Your First NPE

```bash
# 1. Access the platform
open http://localhost:3000

# 2. Register as NPE Operator (use biometric authentication)
# Click "🔐 Register" → Enter operator username → Complete WebAuthn

# 3. Your Primary PKP is automatically generated
# This becomes the master identity for your NPE organization

# 4. View your PKP Dashboard
# Navigate to http://localhost:3000/lit/pkp/dashboard

# 5. You'll see 3 default sub-PKPs automatically created:
# - ai-build#0: For development agent
# - ai-build#1: For testing agent  
# - session#0: For customer interaction agent
```

### Deploying Multiple AI Agents

```javascript
// Mint additional sub-PKPs for specialized agents
await authController.mintSubPKP('sales-agent-1', 'Customer acquisition specialist');
await authController.mintSubPKP('support-agent-1', 'Technical support specialist');
await authController.mintSubPKP('billing-agent-1', 'Payment and invoicing specialist');

// Each agent now has its own cryptographic identity and wallet
// Deploy them in the XR environment:
open http://localhost:3000/paradise
```

---

## 📚 NPE Architecture Guide

### Hierarchical PKP Structure

```
┌─────────────────────────────────────────────┐
│         NPE Operator (Human)                │
│         WebAuthn Biometric Auth             │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │   Primary PKP        │
        │  (Master Identity)   │
        └──────────┬───────────┘
                   │
         ┌─────────┼─────────────────────┐
         │         │                     │
         ▼         ▼                     ▼
    ┌────────┐  ┌────────┐         ┌────────┐
    │Sub-PKP │  │Sub-PKP │   ...   │Sub-PKP │
    │ai-build│  │session │         │custom  │
    │  #0    │  │  #0    │         │  #N    │
    └────────┘  └────────┘         └────────┘
         │         │                     │
         ▼         ▼                     ▼
    ┌────────┐  ┌────────┐         ┌────────┐
    │ Agent  │  │ Agent  │         │ Agent  │
    │   A    │  │   B    │         │   N    │
    └────────┘  └────────┘         └────────┘
```

---

## 🎮 Game Manager Architecture

### Overview

The Beach implements a **Game Manager Pattern** to orchestrate multiple AI agents, handle service requests, and manage the XR environment. The Game Manager acts as the central coordinator for all NPE operations, ensuring efficient resource allocation, load balancing, and seamless customer experiences.

### Core Components

```
┌───────────────────────────────────────────────────────────┐
│                    Game Manager                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Agent     │  │   Service   │  │   Location  │      │
│  │   Registry  │  │   Router    │  │   Manager   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Session   │  │   Analytics │  │   Event     │      │
│  │   Manager   │  │   Engine    │  │   Bus       │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└───────────────────────────────────────────────────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
    ┌────────┐         ┌────────┐        ┌────────┐
    │ Agent  │         │ Agent  │        │ Agent  │
    │Pool #1 │         │Pool #2 │        │Pool #3 │
    └────────┘         └────────┘        └────────┘
```

### Game Manager Responsibilities

#### 1. **Agent Registry & Lifecycle Management**
```javascript
class GameManager {
  constructor() {
    this.agents = new Map(); // agentId -> Agent instance
    this.agentPools = new Map(); // purpose -> Agent[]
    this.activeServices = new Map(); // serviceId -> Service config
  }
  
  // Register new agent with the system
  async registerAgent(agentPKP, purpose, capabilities) {
    const agent = {
      id: agentPKP.address,
      pkp: agentPKP,
      purpose,
      capabilities, // ['sales', 'support', 'consulting']
      status: 'active',
      currentLoad: 0,
      maxLoad: 10,
      location: null, // GPS coordinates if geo-enabled
      serviceArea: null // Geofence polygon
    };
    
    this.agents.set(agent.id, agent);
    this.addToPool(purpose, agent);
    
    console.log(`✅ Agent ${agent.id} registered: ${purpose}`);
    return agent;
  }
  
  // Spawn agent on-demand
  async spawnAgent(purpose, location = null) {
    const subPKP = await this.mintSubPKP(purpose, `Dynamic agent for ${purpose}`);
    return this.registerAgent(subPKP, purpose, this.getDefaultCapabilities(purpose));
  }
  
  // Gracefully shutdown agent
  async decommissionAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent.currentLoad > 0) {
      await this.migrateActiveSessions(agentId);
    }
    this.agents.delete(agentId);
    console.log(`🔴 Agent ${agentId} decommissioned`);
  }
}
```

#### 2. **Service Routing & Load Balancing**
```javascript
// Intelligent request routing to best available agent
async routeRequest(request) {
  const { service, location, priority, customerProfile } = request;
  
  // Get agents capable of handling this service
  const capableAgents = this.agents.values().filter(
    agent => agent.capabilities.includes(service) && 
             agent.status === 'active'
  );
  
  // Apply routing strategy
  const selectedAgent = await this.selectAgent(capableAgents, {
    strategy: 'least-load', // or 'nearest-location', 'highest-rating', 'round-robin'
    location,
    priority
  });
  
  if (!selectedAgent) {
    // No available agents - spawn new one
    console.log(`⚡ Spawning new ${service} agent on-demand`);
    return await this.spawnAgent(service, location);
  }
  
  selectedAgent.currentLoad++;
  return selectedAgent;
}

// Load balancing strategies
selectAgent(agents, options) {
  switch(options.strategy) {
    case 'least-load':
      return agents.reduce((best, agent) => 
        agent.currentLoad < best.currentLoad ? agent : best
      );
      
    case 'nearest-location':
      if (!options.location) return agents[0];
      return this.findNearestAgent(agents, options.location);
      
    case 'highest-rating':
      return agents.sort((a, b) => 
        b.performanceScore - a.performanceScore
      )[0];
      
    case 'round-robin':
      return agents[this.roundRobinIndex++ % agents.length];
  }
}
```

#### 3. **Session Management**
```javascript
// Manage customer-agent sessions
class SessionManager {
  async createSession(customer, agent, service) {
    const session = {
      id: crypto.randomUUID(),
      customerId: customer.id,
      agentId: agent.id,
      service,
      startTime: Date.now(),
      status: 'active',
      context: {}, // Shared conversation context
      transactions: []
    };
    
    this.sessions.set(session.id, session);
    await this.notifyAgent(agent.id, 'new-session', session);
    
    return session;
  }
  
  // Handoff session between agents
  async handoffSession(sessionId, fromAgent, toAgent, reason) {
    const session = this.sessions.get(sessionId);
    session.previousAgent = fromAgent.id;
    session.agentId = toAgent.id;
    session.handoffReason = reason;
    session.handoffTime = Date.now();
    
    // Transfer context to new agent
    await this.transferContext(session, fromAgent, toAgent);
    
    console.log(`🔀 Session ${sessionId} handed off: ${fromAgent.id} → ${toAgent.id}`);
  }
}
```

---

## 🎯 Agent Deployment Patterns

### Pattern 1: **Default Development Pattern** (ai-build#0, ai-build#1, session#0)

**Purpose**: Concurrent AI-powered development and session management

```javascript
// Automatically created on NPE registration
const defaultAgents = [
  {
    purpose: 'ai-build#0',
    role: 'Primary Development Agent',
    capabilities: ['code-generation', 'architecture-design', 'testing'],
    description: 'Main AI agent for concurrent development tasks',
    useCase: 'Generate code, create features, implement business logic'
  },
  {
    purpose: 'ai-build#1', 
    role: 'Secondary Development Agent',
    capabilities: ['code-review', 'optimization', 'debugging'],
    description: 'Parallel development agent for code quality',
    useCase: 'Review code from ai-build#0, suggest improvements, find bugs'
  },
  {
    purpose: 'session#0',
    role: 'Session Coordinator Agent',
    capabilities: ['state-management', 'user-tracking', 'analytics'],
    description: 'Manages user sessions and interaction state',
    useCase: 'Track customer journey, persist conversation context, coordinate handoffs'
  }
];

// Example: Concurrent development workflow
async function concurrentDevelopment(feature) {
  // ai-build#0 generates initial implementation
  const implementation = await aiBuild0.generate(feature.spec);
  
  // ai-build#1 reviews and optimizes in parallel
  const [review, tests] = await Promise.all([
    aiBuild1.review(implementation),
    aiBuild1.generateTests(implementation)
  ]);
  
  // session#0 tracks progress and reports to operator
  await session0.logProgress({
    feature: feature.name,
    implementation,
    review,
    tests,
    status: 'complete'
  });
  
  return { implementation, review, tests };
}
```

### Pattern 2: **Geo-Fenced Service Deployment** 🌍

**Purpose**: Location-based service agents that respond to nearby customer requests

```javascript
// Deploy agents in specific geographic regions
class GeoFencedDeployment {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.serviceDatabase = new Map(); // serviceId -> ServiceListing
    this.geoIndex = new GeoSpatialIndex(); // For fast location queries
  }
  
  // Post a new service with geographic coverage
  async postService(service) {
    const listing = {
      id: crypto.randomUUID(),
      npeId: service.npeId,
      name: service.name,
      category: service.category, // 'food-delivery', 'ride-share', 'consulting'
      location: service.location, // { lat, lng }
      serviceRadius: service.radius || 5000, // meters
      geofence: this.createGeofence(service.location, service.radius),
      agentPKP: service.agentPKP,
      pricing: service.pricing,
      availability: service.availability, // 24/7 or scheduled
      responseTime: service.estimatedResponse || 300 // seconds
    };
    
    // Index service for geographic queries
    this.serviceDatabase.set(listing.id, listing);
    this.geoIndex.insert(listing);
    
    // Deploy agent for this service
    await this.gameManager.registerAgent(
      listing.agentPKP,
      `geo-service-${listing.category}`,
      [listing.category, 'location-based']
    );
    
    console.log(`📍 Service posted: ${listing.name} at (${listing.location.lat}, ${listing.location.lng})`);
    return listing;
  }
  
  // Find nearest service provider based on GPS
  async findNearestProvider(customerLocation, serviceType) {
    // Query geospatial index for nearby services
    const nearbyServices = this.geoIndex.queryRadius(
      customerLocation,
      10000 // 10km search radius
    ).filter(s => s.category === serviceType);
    
    if (nearbyServices.length === 0) {
      return { error: 'No providers found in your area' };
    }
    
    // Calculate distances and sort by proximity
    const servicesWithDistance = nearbyServices.map(service => ({
      ...service,
      distance: this.calculateDistance(customerLocation, service.location),
      eta: this.estimateArrival(customerLocation, service.location, service.responseTime)
    })).sort((a, b) => a.distance - b.distance);
    
    // Return nearest provider (first responder)
    const nearest = servicesWithDistance[0];
    
    console.log(`🎯 Nearest ${serviceType}: ${nearest.name} (${nearest.distance}m away, ETA: ${nearest.eta}min)`);
    
    // Route request to agent
    const agent = this.gameManager.agents.get(nearest.agentPKP.address);
    await this.gameManager.routeRequest({
      service: serviceType,
      location: customerLocation,
      provider: nearest,
      customer: { location: customerLocation }
    });
    
    return nearest;
  }
  
  // Calculate distance between two points (Haversine formula)
  calculateDistance(point1, point2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
  }
  
  // Create circular geofence polygon
  createGeofence(center, radius) {
    const points = [];
    const steps = 32;
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      points.push({
        lat: center.lat + (radius / 111320) * Math.cos(angle),
        lng: center.lng + (radius / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle)
      });
    }
    return points;
  }
}

// Example: Food delivery service
const foodDelivery = await geoFencedDeployment.postService({
  npeId: 'npe-restaurant-123',
  name: 'Tropical Smoothie Bar',
  category: 'food-delivery',
  location: { lat: 25.7617, lng: -80.1918 }, // Miami Beach
  radius: 5000, // 5km delivery radius
  agentPKP: await mintSubPKP('delivery-agent-miami', 'Food delivery coordinator'),
  pricing: { deliveryFee: 5.99, minimumOrder: 15.00 },
  availability: '24/7',
  estimatedResponse: 45 * 60 // 45 minutes
});

// Customer requests nearby service
const customerLocation = { lat: 25.7650, lng: -80.1900 }; // 400m away
const nearestProvider = await geoFencedDeployment.findNearestProvider(
  customerLocation,
  'food-delivery'
);
// → Returns: Tropical Smoothie Bar (412m away, ETA: 6min)
```

### Pattern 3: **Specialized Service Teams** 🏢

**Purpose**: Deploy complementary agents that work together

```javascript
// Example: Real estate service team
const realEstateTeam = {
  listing: {
    purpose: 'real-estate-listing-agent',
    capabilities: ['property-search', 'market-analysis', 'virtual-tours'],
    agentPKP: await mintSubPKP('re-listing', 'Property listing specialist')
  },
  
  financing: {
    purpose: 'real-estate-finance-agent',
    capabilities: ['mortgage-calculation', 'pre-approval', 'loan-comparison'],
    agentPKP: await mintSubPKP('re-finance', 'Mortgage specialist')
  },
  
  closing: {
    purpose: 'real-estate-closing-agent',
    capabilities: ['contract-review', 'escrow-management', 'title-insurance'],
    agentPKP: await mintSubPKP('re-closing', 'Closing coordinator')
  },
  
  inspector: {
    purpose: 'real-estate-inspection-agent',
    capabilities: ['property-inspection', 'defect-reporting', 'repair-estimates'],
    agentPKP: await mintSubPKP('re-inspector', 'Property inspector')
  }
};

// Coordinated workflow
async function homebuying Process(customer) {
  // 1. Listing agent shows properties
  const properties = await realEstateTeam.listing.search(customer.criteria);
  const selectedProperty = await customer.selectProperty(properties);
  
  // 2. Finance agent handles pre-approval
  const financing = await realEstateTeam.financing.preApprove({
    customer,
    property: selectedProperty,
    downPayment: customer.downPayment
  });
  
  // 3. Inspector evaluates property
  const inspection = await realEstateTeam.inspector.inspect(selectedProperty);
  
  // 4. Closing agent finalizes transaction
  if (inspection.approved) {
    await realEstateTeam.closing.initiateClosing({
      property: selectedProperty,
      buyer: customer,
      financing,
      inspection
    });
  }
}
```

### Pattern 4: **Dynamic Scaling Pattern** 📈

**Purpose**: Auto-scale agents based on demand

```javascript
class AutoScalingManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.metrics = {
      requestQueue: [],
      avgResponseTime: 0,
      agentUtilization: {}
    };
    
    // Monitor every 30 seconds
    setInterval(() => this.checkScaling(), 30000);
  }
  
  async checkScaling() {
    const utilization = this.calculateUtilization();
    
    // Scale up if agents are overloaded
    if (utilization > 0.8) {
      console.log(`⬆️ High load detected (${(utilization * 100).toFixed(1)}%), scaling up`);
      await this.scaleUp();
    }
    
    // Scale down if agents are underutilized
    if (utilization < 0.3 && this.gameManager.agents.size > 3) {
      console.log(`⬇️ Low load detected (${(utilization * 100).toFixed(1)}%), scaling down`);
      await this.scaleDown();
    }
  }
  
  async scaleUp() {
    // Spawn agents for high-demand services
    const demandAnalysis = this.analyzeDemand();
    
    for (const [service, demand] of Object.entries(demandAnalysis)) {
      if (demand.queueLength > 5) {
        await this.gameManager.spawnAgent(service);
      }
    }
  }
  
  async scaleDown() {
    // Decommission idle agents
    const idleAgents = Array.from(this.gameManager.agents.values())
      .filter(agent => agent.currentLoad === 0 && 
                       !agent.purpose.includes('default'))
      .sort((a, b) => a.lastActivity - b.lastActivity);
    
    if (idleAgents.length > 0) {
      await this.gameManager.decommissionAgent(idleAgents[0].id);
    }
  }
}
```

### Pattern 5: **Event-Driven Agent Activation** ⚡

**Purpose**: Activate agents in response to specific events

```javascript
// Event-based agent deployment
class EventDrivenDeployment {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.eventBus = new EventEmitter();
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // Deploy support agent when error detected
    this.eventBus.on('customer-error', async (error) => {
      const supportAgent = await this.gameManager.routeRequest({
        service: 'emergency-support',
        priority: 'high',
        context: error
      });
      await supportAgent.handleEmergency(error);
    });
    
    // Deploy sales agent when high-value customer detected
    this.eventBus.on('high-value-customer', async (customer) => {
      const premiumAgent = await this.gameManager.spawnAgent('premium-sales');
      await premiumAgent.greet(customer, 'vip-welcome');
    });
    
    // Deploy compliance agent when regulated transaction occurs
    this.eventBus.on('regulated-transaction', async (transaction) => {
      const complianceAgent = await this.gameManager.routeRequest({
        service: 'compliance-review',
        priority: 'high'
      });
      await complianceAgent.review(transaction);
    });
  }
}
```

---

## 🔐 Authentication Flow

### For NPE Operators (Humans)

```javascript
// 1. Operator registers with biometric authentication
await authController.register('npe-operator-name');
// → WebAuthn prompt (fingerprint/face/security key)
// → Primary PKP generated deterministically
// → 3 default sub-PKPs created (ai-build#0, ai-build#1, session#0)

// 2. Operator logs in (subsequent sessions)
await authController.login();
// → WebAuthn authentication
// → Session established (24-hour validity)
// → Access to PKP dashboard and agent management

// 3. Operator manages agents
await authController.fetchPKPDashboard();
// → View all sub-PKPs and their assigned agents
// → Monitor agent performance and revenue
// → Create new agents as needed
```

### For AI Agents (NPEs)

```javascript
// Agents operate using sub-PKPs (no biometric needed)
// Each agent has:
// - Unique Ethereum address (from sub-PKP)
// - Ability to sign transactions
// - Persistent identity across sessions

// Example: Agent initiates transaction
const agentPKP = getSubPKP('sales-agent-1');
const transaction = await agentPKP.signTransaction({
  to: customerWallet,
  value: servicePrice,
  data: invoiceDetails
});
```

---

## � NPE Manager Dashboard

### Overview

Inspired by [Y8's NPE Manager](https://y8-app.vercel.app/blog/npe-manager-guide), The Beach provides a comprehensive web-based dashboard for managing your NPE fleet. Access it at `/shop` → **Digital** tab.

### Key Features

#### 1. **Generate New NPEs** 🎭

```javascript
// UI: Click "Generate NPE" button
// Backend creates new PKP with default schema
const newNPE = await npeManager.generateNPE({
  name: 'Customer Service Agent #4',
  type: 'service-provider',
  category: 'support',
  location: null, // Set later if geo-enabled
  tier: 'freemium' // Based on user's subscription
});

console.log(`
🎉 New NPE Created!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Address: ${newNPE.pkpAddress}
Public Key: ${newNPE.publicKey}
Type: ${newNPE.type}
Status: Active
`);
```

#### 2. **View & Refresh PKPs** 🔄

```javascript
// Fetch all PKPs associated with your account
async function refreshPKPs() {
  const pkps = await fetch('/lit/pkp/dashboard', {
    credentials: 'include' // Include session cookie
  }).then(r => r.json());
  
  return {
    primaryPKP: pkps.primaryPKP,
    subPKPs: pkps.subPKPs, // Array of all NPEs
    totalNPEs: pkps.subPKPs.length,
    tierLimit: pkps.tierInfo.maxNPEs
  };
}

// Display in UI
const dashboard = await refreshPKPs();
console.log(`
📊 Your NPE Fleet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary PKP: ${dashboard.primaryPKP.address}
Total NPEs: ${dashboard.totalNPEs} / ${dashboard.tierLimit}
Active: ${dashboard.subPKPs.filter(n => n.status === 'active').length}
Tier: ${dashboard.tierInfo.tier}
`);
```

#### 3. **Manage NPE Schemas** 📝

Following Y8's extensible schema model:

```javascript
// NPE Schema Editor Component
class NPESchemaEditor {
  constructor(npeId) {
    this.npeId = npeId;
    this.schema = null;
  }
  
  async loadSchema() {
    this.schema = await fetch(`/npe/${this.npeId}/schema`).then(r => r.json());
    this.renderFields();
  }
  
  renderFields() {
    const fields = Object.entries(this.schema.customFields);
    return `
      <div class="npe-schema-editor">
        <h3>Edit NPE Schema: ${this.schema.name}</h3>
        
        <!-- Core Fields (read-only) -->
        <div class="core-fields">
          <label>PKP Address:</label>
          <input disabled value="${this.schema.pkpAddress}" />
          
          <label>Type:</label>
          <input disabled value="${this.schema.type}" />
        </div>
        
        <!-- Custom Fields (editable) -->
        <div class="custom-fields">
          ${fields.map(([key, value]) => `
            <div class="field-row">
              <label>${key}:</label>
              <input 
                id="field-${key}" 
                value="${value}"
                onchange="editor.updateField('${key}', this.value)"
              />
              <button onclick="editor.removeField('${key}')">🗑️</button>
            </div>
          `).join('')}
        </div>
        
        <!-- Add New Field -->
        <div class="add-field">
          <input id="new-field-name" placeholder="Field name" />
          <input id="new-field-value" placeholder="Field value" />
          <button onclick="editor.addField()">➕ Add Field</button>
        </div>
        
        <!-- Tier Limit Warning -->
        ${this.checkTierLimit()}
        
        <button onclick="editor.saveSchema()">💾 Save Schema</button>
      </div>
    `;
  }
  
  checkTierLimit() {
    const currentFields = Object.keys(this.schema.customFields).length;
    const maxFields = this.schema.tierInfo.maxSchemaFields;
    
    if (currentFields >= maxFields) {
      return `
        <div class="tier-warning">
          ⚠️ You've reached your schema field limit (${maxFields} fields).
          <a href="/shop?upgrade=true">Upgrade to ${this.getNextTier()}</a> 
          to add more fields.
        </div>
      `;
    }
    return '';
  }
  
  async addField() {
    const name = document.getElementById('new-field-name').value;
    const value = document.getElementById('new-field-value').value;
    
    if (!name || !value) {
      alert('Please enter both field name and value');
      return;
    }
    
    // Check tier limit
    const currentFields = Object.keys(this.schema.customFields).length;
    if (currentFields >= this.schema.tierInfo.maxSchemaFields) {
      alert(`Schema field limit reached. Upgrade to add more fields.`);
      return;
    }
    
    this.schema.customFields[name] = value;
    await this.saveSchema();
    this.renderFields();
  }
  
  async removeField(fieldName) {
    if (confirm(`Remove field "${fieldName}"?`)) {
      delete this.schema.customFields[fieldName];
      await this.saveSchema();
      this.renderFields();
    }
  }
  
  async updateField(fieldName, newValue) {
    this.schema.customFields[fieldName] = newValue;
    // Auto-save after 500ms debounce
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveSchema(), 500);
  }
  
  async saveSchema() {
    const response = await fetch(`/npe/${this.npeId}/schema`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(this.schema)
    });
    
    if (response.ok) {
      console.log('✅ Schema saved successfully');
      this.showNotification('Schema saved!', 'success');
    } else {
      console.error('❌ Failed to save schema');
      this.showNotification('Failed to save schema', 'error');
    }
  }
  
  getNextTier() {
    const tiers = ['freemium', 'base', 'premium'];
    const currentIndex = tiers.indexOf(this.schema.tierInfo.tier);
    return tiers[currentIndex + 1] || 'premium';
  }
  
  showNotification(message, type) {
    // Display toast notification
    const toast = document.createElement('div');
    toast.className = `notification ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// Usage
const editor = new NPESchemaEditor('npe-customer-service-4');
await editor.loadSchema();
```

#### 4. **NPE Analytics Dashboard** 📊

```javascript
// Real-time NPE performance metrics
class NPEAnalyticsDashboard {
  async render(npeId) {
    const metrics = await this.fetchMetrics(npeId);
    
    return `
      <div class="npe-analytics">
        <h2>📊 ${metrics.name} - Performance</h2>
        
        <!-- Key Metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <h4>Total Sessions</h4>
            <div class="value">${metrics.totalSessions}</div>
            <div class="change">+${metrics.sessionsChange}% this week</div>
          </div>
          
          <div class="metric-card">
            <h4>Success Rate</h4>
            <div class="value">${(metrics.successRate * 100).toFixed(1)}%</div>
            <div class="change">${metrics.successTrend}</div>
          </div>
          
          <div class="metric-card">
            <h4>Avg Response Time</h4>
            <div class="value">${metrics.avgResponseTime}s</div>
            <div class="change">${metrics.responseTrend}</div>
          </div>
          
          <div class="metric-card">
            <h4>Revenue (ETH)</h4>
            <div class="value">${metrics.revenue.total}</div>
            <div class="change">+${metrics.revenue.thisMonth} this month</div>
          </div>
        </div>
        
        <!-- Customer Satisfaction -->
        <div class="satisfaction-chart">
          <h4>⭐ Customer Satisfaction: ${metrics.customerSatisfaction}/5</h4>
          <div class="rating-bar">
            <div class="fill" style="width: ${metrics.customerSatisfaction * 20}%"></div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="recent-activity">
          <h4>📝 Recent Activity</h4>
          <ul>
            ${metrics.recentActivity.map(activity => `
              <li>
                <span class="time">${this.formatTime(activity.timestamp)}</span>
                <span class="event">${activity.event}</span>
                <span class="customer">${activity.customer}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        
        <!-- Location Map (if geo-enabled) -->
        ${metrics.location ? this.renderLocationMap(metrics) : ''}
      </div>
    `;
  }
  
  async fetchMetrics(npeId) {
    return await fetch(`/npe/${npeId}/analytics`).then(r => r.json());
  }
  
  renderLocationMap(metrics) {
    return `
      <div class="location-map">
        <h4>📍 Service Area</h4>
        <div id="map-${metrics.npeId}" class="map-container"></div>
        <p>
          Location: ${metrics.location.lat}, ${metrics.location.lng}<br>
          Service Radius: ${metrics.location.serviceRadius}m<br>
          Recent Customers: ${metrics.locationStats.customersInRadius}
        </p>
      </div>
    `;
  }
  
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }
}
```

#### 5. **Batch NPE Operations** 🔧

```javascript
// Manage multiple NPEs simultaneously
class BatchNPEManager {
  async batchUpdate(npeIds, updates) {
    const results = await Promise.all(
      npeIds.map(id => this.updateNPE(id, updates))
    );
    
    console.log(`✅ Updated ${results.filter(r => r.success).length} NPEs`);
    return results;
  }
  
  async batchActivate(npeIds) {
    return this.batchUpdate(npeIds, { status: 'active' });
  }
  
  async batchPause(npeIds) {
    return this.batchUpdate(npeIds, { status: 'paused' });
  }
  
  async batchDelete(npeIds) {
    if (!confirm(`Delete ${npeIds.length} NPEs? This cannot be undone.`)) {
      return;
    }
    
    const results = await Promise.all(
      npeIds.map(id => fetch(`/npe/${id}`, { method: 'DELETE' }))
    );
    
    console.log(`🗑️ Deleted ${results.filter(r => r.ok).length} NPEs`);
    return results;
  }
  
  async bulkSchemaUpdate(npeIds, fieldUpdates) {
    // Update specific fields across multiple NPEs
    return this.batchUpdate(npeIds, {
      customFields: fieldUpdates
    });
  }
}

// Example: Update all customer service agents
const batchManager = new BatchNPEManager();
const customerServiceNPEs = ['npe-cs-1', 'npe-cs-2', 'npe-cs-3'];

await batchManager.bulkSchemaUpdate(customerServiceNPEs, {
  operatingHours: '24/7',
  languages: ['English', 'Spanish', 'French'],
  priority: 'high'
});
```

### UI Screenshots (Conceptual)

```
┌──────────────────────────────────────────────────────────┐
│  🏝️ The Beach - NPE Manager                             │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Your NPE Fleet (7 / 25)                    [Base Tier] │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ✅ ai-build#0         Development Agent           │ │
│  │  ✅ ai-build#1         Testing Agent               │ │
│  │  ✅ session#0          Session Manager             │ │
│  │  ✅ watersports-rental Equipment Rental Agent      │ │
│  │  ✅ food-delivery      Food Delivery Coordinator   │ │
│  │  ✅ mobile-massage     Wellness Agent              │ │
│  │  ✅ beach-photographer Photography Agent           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  [🎭 Generate NPE]  [🔄 Refresh PKPs]  [⬆️ Upgrade]    │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  Selected: food-delivery                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  📊 Analytics          📝 Edit Schema              │ │
│  │  ────────────────────  ─────────────────────────   │ │
│  │  Sessions: 327         Name: Beach Bites Delivery  │ │
│  │  Success: 99.2%        Type: food-delivery         │ │
│  │  Response: 4.2s        Location: 25.7650, -80.1900│ │
│  │  Rating: 4.7/5         Radius: 5000m               │ │
│  │  Revenue: 4.89 ETH     Hours: 24/7                 │ │
│  │                                                     │ │
│  │  Custom Fields (8 / 25):                          │ │
│  │  • deliveryFee: 5.99                              │ │
│  │  • minimumOrder: 15.00                            │ │
│  │  • cuisineTypes: ["American", "Asian", "Italian"] │ │
│  │  • avgDeliveryTime: 30                            │ │
│  │  [➕ Add Field]                                    │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## �🌐 API Endpoints

### NPE Management

```javascript
// Authentication
POST /lit/webauthn/register-options    // Start registration
POST /lit/webauthn/verify-registration // Complete registration
POST /lit/webauthn/authenticate-options // Start login
POST /lit/webauthn/verify-authentication // Complete login
POST /lit/session/logout               // End session

// PKP Dashboard & Management
GET  /lit/pkp/dashboard                // View primary PKP + all sub-PKPs
POST /lit/pkp/mint                     // Create new sub-PKP for agent
GET  /lit/pkp/ai-builds                // List development agents
GET  /lit/session/status               // Check authentication state
GET  /lit/user/profile                 // Get operator details

// NPE Manager (inspired by Y8)
GET  /shop/digital                     // NPE Manager UI
POST /npe/generate                     // Generate new NPE (mint PKP)
GET  /npe/list                         // List all user's NPEs
GET  /npe/:id                          // Get specific NPE details
PUT  /npe/:id                          // Update NPE configuration
DELETE /npe/:id                        // Delete NPE (decommission)

// NPE Schema Management
GET  /npe/:id/schema                   // Get NPE schema
PUT  /npe/:id/schema                   // Update NPE schema
POST /npe/:id/schema/field             // Add custom field to schema
DELETE /npe/:id/schema/field/:name     // Remove custom field

// NPE Analytics
GET  /npe/:id/analytics                // Get NPE performance metrics
GET  /npe/:id/sessions                 // Get NPE session history
GET  /npe/:id/revenue                  // Get NPE revenue data
GET  /npe/:id/customers                // Get NPE customer interactions

// Batch Operations
POST /npe/batch/update                 // Batch update multiple NPEs
POST /npe/batch/activate               // Activate multiple NPEs
POST /npe/batch/pause                  // Pause multiple NPEs
POST /npe/batch/delete                 // Delete multiple NPEs

// Geo-Fenced Services
POST /service/post                     // Post geo-fenced service
GET  /service/nearby                   // Find nearby services (lat, lng, radius)
GET  /service/:id                      // Get service details
PUT  /service/:id                      // Update service configuration
DELETE /service/:id                    // Remove service

// XR Environment
GET  /xr/paradise                      // Load immersive XR scene
POST /xr/load-paradise                 // Initialize scene assets
POST /xr/session/end                   // End XR session
GET  /xr/analytics                     // View NPE performance metrics
GET  /xr/locations                     // List all XR locations (tier-based)
POST /xr/location                      // Create new XR location (premium)
```

### API Examples

#### Generate a New NPE

```javascript
// POST /npe/generate
const response = await fetch('/npe/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Customer Support Agent #1',
    type: 'service-provider',
    category: 'support',
    capabilities: ['chat', 'phone', 'email'],
    location: { lat: 25.7617, lng: -80.1918 },
    serviceRadius: 5000
  })
});

const npe = await response.json();
console.log(`✅ NPE Created: ${npe.pkpAddress}`);
```

#### Update NPE Schema

```javascript
// PUT /npe/:id/schema
await fetch(`/npe/${npeId}/schema`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    customFields: {
      languages: ['English', 'Spanish'],
      operatingHours: '9am-5pm',
      specialization: 'technical-support',
      certifications: ['AWS', 'Azure']
    }
  })
});
```

#### Find Nearest Service

```javascript
// GET /service/nearby?lat=25.7650&lng=-80.1900&category=food-delivery
const response = await fetch(
  '/service/nearby?' + new URLSearchParams({
    lat: 25.7650,
    lng: -80.1900,
    category: 'food-delivery',
    radius: 10000 // 10km
  })
);

const services = await response.json();
console.log(`Found ${services.length} services nearby`);
services.forEach(s => {
  console.log(`${s.name}: ${s.distance}m away (ETA: ${s.eta}min)`);
});
```

#### Batch Update NPEs

```javascript
// POST /npe/batch/update
await fetch('/npe/batch/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    npeIds: ['npe-1', 'npe-2', 'npe-3'],
    updates: {
      customFields: {
        priority: 'high',
        alertEmail: 'alerts@example.com'
      }
    }
  })
});
```

#### Get NPE Analytics

```javascript
// GET /npe/:id/analytics
const analytics = await fetch(`/npe/${npeId}/analytics`)
  .then(r => r.json());

console.log(`
📊 NPE Analytics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Sessions: ${analytics.totalSessions}
Success Rate: ${(analytics.successRate * 100).toFixed(1)}%
Avg Response Time: ${analytics.avgResponseTime}s
Customer Satisfaction: ${analytics.customerSatisfaction}/5
Revenue (Total): ${analytics.revenue.total} ETH
Revenue (This Month): ${analytics.revenue.thisMonth} ETH
`);
```


---

## 🛡️ Security Best Practices for NPEs

### Operator Security

```javascript
// 1. Use hardware security keys for WebAuthn
// Recommended: YubiKey, Google Titan, or device biometrics

// 2. Regular session rotation
setInterval(async () => {
  await authController.rotateSession();
}, 6 * 60 * 60 * 1000); // Every 6 hours

// 3. Audit agent activities
await authController.exportAuditLog('2025-01-01', '2025-12-31');
```

### Agent Security

```javascript
// 1. Isolate sub-PKPs by purpose
// Never reuse sub-PKPs across different agent roles

// 2. Set spending limits per agent
await agentPKP.setTransactionLimit({
  maxPerTransaction: '0.1 ETH',
  maxDailyTotal: '1 ETH',
  requireApproval: '> 0.5 ETH'
});

// 3. Monitor for anomalous behavior
monitorAgent(agentPKP, {
  alertOn: ['unusual-spending', 'rapid-transactions', 'failed-auth'],
  autoDisable: true // Disable agent if suspicious activity detected
});
```

---

## 🌟 Real-World Implementation Example

### Scenario: "Beach Concierge Services" - Multi-Agent Tourism Platform

Let's build a complete NPE platform that combines all deployment patterns to create a comprehensive tourism service in Miami Beach.

#### Step 1: Initialize the Game Manager

```javascript
// Initialize core system
const gameManager = new GameManager();
const geoDeployment = new GeoFencedDeployment(gameManager);
const autoScaler = new AutoScalingManager(gameManager);
const eventDriven = new EventDrivenDeployment(gameManager);

// Register NPE operator
const operator = await authController.register('beach-concierge-npe');
console.log(`✅ NPE registered with primary PKP: ${operator.primaryPKP.address}`);
```

#### Step 2: Deploy Default Development Team (ai-build#0, ai-build#1, session#0)

```javascript
// These are automatically created on registration
const developmentTeam = {
  aiBuild0: gameManager.agents.get('ai-build#0'),
  aiBuild1: gameManager.agents.get('ai-build#1'),
  session0: gameManager.agents.get('session#0')
};

// ai-build#0 and ai-build#1 continuously improve the platform
async function continuousImprovement() {
  while (true) {
    // ai-build#0: Analyze customer feedback and generate improvements
    const feedback = await session0.getCustomerFeedback();
    const improvements = await aiBuild0.generateImprovements(feedback);
    
    // ai-build#1: Review and test improvements
    const validated = await aiBuild1.validateImprovements(improvements);
    
    // Deploy if tests pass
    if (validated.allTestsPassed) {
      await gameManager.deployUpdate(validated.changes);
      console.log(`🚀 Platform improved: ${validated.changes.length} updates deployed`);
    }
    
    await sleep(3600000); // Check every hour
  }
}
continuousImprovement();
```

#### Step 3: Deploy Geo-Fenced Service Agents

```javascript
// Deploy location-based services across Miami Beach

// 1. Beach Activity Rentals
const watersportsAgent = await geoDeployment.postService({
  npeId: 'beach-concierge-npe',
  name: 'Tropical Watersports Rentals',
  category: 'equipment-rental',
  location: { lat: 25.7617, lng: -80.1918 }, // South Beach
  radius: 2000, // 2km coverage
  agentPKP: await authController.mintSubPKP('watersports-rental', 'Jet ski, paddleboard, kayak rentals'),
  pricing: { jetski: 80, paddleboard: 30, kayak: 25 },
  availability: '8am-6pm',
  estimatedResponse: 15 * 60 // 15 min delivery to customer location
});

// 2. Food & Beverage Delivery
const foodDeliveryAgent = await geoDeployment.postService({
  npeId: 'beach-concierge-npe',
  name: 'Beach Bites Delivery',
  category: 'food-delivery',
  location: { lat: 25.7650, lng: -80.1900 },
  radius: 5000, // 5km coverage
  agentPKP: await authController.mintSubPKP('food-delivery', 'Beach food & drinks'),
  pricing: { deliveryFee: 5.99, minimumOrder: 15 },
  availability: '24/7',
  estimatedResponse: 30 * 60 // 30 min delivery
});

// 3. Beach Massage Services
const massageAgent = await geoDeployment.postService({
  npeId: 'beach-concierge-npe',
  name: 'Tropical Spa Mobile',
  category: 'wellness',
  location: { lat: 25.7700, lng: -80.1850 },
  radius: 3000, // 3km coverage
  agentPKP: await authController.mintSubPKP('mobile-massage', 'Beach massage therapy'),
  pricing: { massage60min: 120, massage90min: 170 },
  availability: '9am-7pm',
  estimatedResponse: 20 * 60 // 20 min arrival
});

// 4. Photography Services
const photoAgent = await geoDeployment.postService({
  npeId: 'beach-concierge-npe',
  name: 'Beach Memories Photography',
  category: 'photography',
  location: { lat: 25.7680, lng: -80.1920 },
  radius: 4000, // 4km coverage
  agentPKP: await authController.mintSubPKP('beach-photographer', 'Professional beach photos'),
  pricing: { photoSession: 200, instantPrint: 15 },
  availability: 'sunrise-sunset',
  estimatedResponse: 25 * 60 // 25 min arrival
});

console.log(`📍 Deployed 4 geo-fenced services covering 5km radius`);
```

#### Step 4: Deploy Specialized Service Team

```javascript
// Create comprehensive concierge team
const conciergeTeam = {
  // First contact agent - greets and qualifies customers
  greeter: await gameManager.registerAgent(
    await authController.mintSubPKP('concierge-greeter', 'Customer greeting & qualification'),
    'customer-greeting',
    ['welcome', 'needs-assessment', 'routing']
  ),
  
  // Activity coordinator - plans daily itineraries  
  activities: await gameManager.registerAgent(
    await authController.mintSubPKP('concierge-activities', 'Activity planning & booking'),
    'activity-coordination',
    ['itinerary-planning', 'booking', 'scheduling', 'group-coordination']
  ),
  
  // VIP services - handles premium customers
  vip: await gameManager.registerAgent(
    await authController.mintSubPKP('concierge-vip', 'VIP & luxury services'),
    'vip-services',
    ['luxury-experiences', 'yacht-charter', 'private-events', 'celebrity-services']
  ),
  
  // Problem solver - handles issues and complaints
  support: await gameManager.registerAgent(
    await authController.mintSubPKP('concierge-support', 'Issue resolution & support'),
    'customer-support',
    ['problem-solving', 'refunds', 'rescheduling', 'emergency-assistance']
  ),
  
  // Payment processor - handles all transactions
  billing: await gameManager.registerAgent(
    await authController.mintSubPKP('concierge-billing', 'Payment & invoicing'),
    'payment-processing',
    ['payment-processing', 'invoicing', 'receipt-generation', 'refunds']
  )
};

console.log(`👥 Deployed 5-agent concierge team`);
```

#### Step 5: Implement Customer Journey

```javascript
// Complete customer interaction flow
class CustomerJourney {
  constructor(customer) {
    this.customer = customer;
    this.session = null;
    this.services = [];
  }
  
  async start() {
    // 1. Customer opens app and shares location
    console.log(`📱 Customer ${this.customer.name} at (${this.customer.location.lat}, ${this.customer.location.lng})`);
    
    // 2. Greeter agent welcomes customer
    this.session = await gameManager.createSession(this.customer, conciergeTeam.greeter, 'welcome');
    const greeting = await conciergeTeam.greeter.greet(this.customer);
    console.log(`👋 ${greeting.message}`);
    
    // 3. Customer requests nearby services
    const request = {
      type: 'equipment-rental',
      item: 'jet ski',
      duration: '2 hours',
      location: this.customer.location
    };
    
    // 4. Find nearest provider
    const provider = await geoDeployment.findNearestProvider(
      this.customer.location,
      request.type
    );
    console.log(`🎯 Found: ${provider.name} (${provider.distance}m away, ETA: ${provider.eta}min)`);
    
    // 5. Route to activity coordinator for booking
    await gameManager.handoffSession(
      this.session.id,
      conciergeTeam.greeter,
      conciergeTeam.activities,
      'booking-requested'
    );
    
    const booking = await conciergeTeam.activities.book({
      provider,
      request,
      customer: this.customer
    });
    console.log(`✅ Booked: ${request.item} for ${request.duration}`);
    
    // 6. Process payment
    await gameManager.handoffSession(
      this.session.id,
      conciergeTeam.activities,
      conciergeTeam.billing,
      'payment-required'
    );
    
    const payment = await conciergeTeam.billing.processPayment({
      customer: this.customer,
      amount: booking.totalPrice,
      description: `${request.item} rental - ${request.duration}`
    });
    console.log(`💳 Payment processed: $${payment.amount} via ${this.customer.pkp.address}`);
    
    // 7. Service delivered
    this.services.push({
      provider,
      booking,
      payment,
      deliveryTime: Date.now() + (provider.eta * 60 * 1000)
    });
    
    // 8. Track delivery in real-time
    await this.trackDelivery(provider, booking);
    
    // 9. Post-service feedback
    await this.collectFeedback();
    
    return {
      session: this.session,
      services: this.services,
      totalSpent: this.services.reduce((sum, s) => sum + s.payment.amount, 0)
    };
  }
  
  async trackDelivery(provider, booking) {
    console.log(`🚤 Tracking ${provider.name} delivery...`);
    
    // Simulate real-time tracking
    const updates = setInterval(async () => {
      const status = await provider.agent.getDeliveryStatus(booking.id);
      console.log(`📍 ${status.message} (${status.eta}min remaining)`);
      
      if (status.delivered) {
        clearInterval(updates);
        console.log(`🎉 Service delivered! Enjoy your ${booking.item}!`);
      }
    }, 60000); // Update every minute
  }
  
  async collectFeedback() {
    // session#0 collects feedback for continuous improvement
    const feedback = await session0.collectFeedback({
      customer: this.customer,
      services: this.services,
      session: this.session
    });
    
    // Store for ai-build#0 analysis
    await aiBuild0.analyzeFeedback(feedback);
    
    console.log(`⭐ Feedback collected: ${feedback.rating}/5 stars`);
  }
}

// Execute customer journey
const customer = {
  name: 'Sarah Martinez',
  id: 'customer-12345',
  location: { lat: 25.7640, lng: -80.1910 }, // 300m from providers
  pkp: { address: '0xCustomerPKPAddress...' },
  preferences: { vip: false }
};

const journey = new CustomerJourney(customer);
const result = await journey.start();

console.log(`
🎊 Journey Complete!
   Services Used: ${result.services.length}
   Total Spent: $${result.totalSpent}
   Session Duration: ${(Date.now() - result.session.startTime) / 60000} minutes
`);
```

#### Step 6: Auto-Scaling in Action

```javascript
// Simulate rush hour - many customers arrive
async function simulateRushHour() {
  console.log(`🌅 Rush hour started - beach is getting crowded!`);
  
  // 50 customers arrive within 10 minutes
  const customers = Array.from({ length: 50 }, (_, i) => ({
    name: `Customer ${i + 1}`,
    location: {
      lat: 25.7617 + (Math.random() * 0.01),
      lng: -80.1918 + (Math.random() * 0.01)
    }
  }));
  
  // Process all customer requests
  const journeys = customers.map(customer => new CustomerJourney(customer).start());
  
  // AutoScalingManager detects high load
  // → Spawns additional agents automatically
  await Promise.all(journeys);
  
  console.log(`
  📊 Rush Hour Stats:
     Customers Served: ${customers.length}
     Peak Agent Count: ${gameManager.agents.size}
     Avg Response Time: ${autoScaler.metrics.avgResponseTime}s
     Customer Satisfaction: 4.8/5
  `);
}
```

#### Step 7: Event-Driven Responses

```javascript
// Automatic responses to events

// High-value customer detected → Deploy VIP agent
eventDriven.eventBus.emit('high-value-customer', {
  name: 'Celebrity Guest',
  location: { lat: 25.7700, lng: -80.1850 },
  estimatedSpend: 5000,
  preferences: { privacy: 'maximum', luxury: true }
});
// → VIP agent automatically assigned

// Weather alert → Notify all active customers
eventDriven.eventBus.on('weather-alert', async (alert) => {
  if (alert.type === 'thunderstorm') {
    const activeSessions = gameManager.sessions.getActive();
    
    for (const session of activeSessions) {
      await conciergeTeam.support.notifyCustomer(session.customerId, {
        message: '⚠️ Thunderstorm approaching. Please return to shore.',
        urgency: 'high',
        alternatives: ['Indoor activities', 'Rescheduling', 'Full refund']
      });
    }
  }
});

// Service complaint → Auto-escalate
eventDriven.eventBus.on('customer-complaint', async (complaint) => {
  // Immediately route to support agent
  const supportAgent = conciergeTeam.support;
  await supportAgent.handleComplaint(complaint);
  
  // If high-priority, notify human operator
  if (complaint.severity === 'high') {
    await operator.notify({
      type: 'urgent-complaint',
      customer: complaint.customer,
      issue: complaint.issue,
      agent: supportAgent.id
    });
  }
});
```

### Expected Results

```
📊 Beach Concierge Services - Daily Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 Active Agents:
   ├─ Default: 3 (ai-build#0, ai-build#1, session#0)
   ├─ Geo-Fenced: 4 (watersports, food, massage, photo)
   ├─ Concierge Team: 5 (greeter, activities, vip, support, billing)
   ├─ Auto-Scaled: 8 (spawned during rush hours)
   └─ Total: 20 agents

📍 Geographic Coverage:
   ├─ Primary Zone: 5km radius (South Beach)
   ├─ Services: 4 categories across 2-5km coverage each
   └─ Response Time: Avg 18 minutes

👥 Customer Metrics:
   ├─ Customers Served: 327
   ├─ Avg Session Duration: 42 minutes
   ├─ Services per Customer: 2.3
   ├─ Customer Satisfaction: 4.7/5
   └─ Repeat Rate: 68%

💰 Revenue:
   ├─ Equipment Rentals: $6,240
   ├─ Food Delivery: $4,890
   ├─ Wellness Services: $3,360
   ├─ Photography: $2,800
   ├─ VIP Services: $12,500
   └─ Total: $29,790

⚡ Performance:
   ├─ Avg Response Time: 4.2 seconds
   ├─ Agent Utilization: 73%
   ├─ Successful Transactions: 99.2%
   └─ Incident Resolution: 96% first-contact

🔄 Platform Improvements (via ai-build agents):
   ├─ Code Updates Deployed: 12
   ├─ Features Added: 3
   ├─ Bugs Fixed: 7
   └─ Performance Optimizations: 5
```

---

## 🚀 Deployment Guide

### Development Mode
```bash
npm run start:dev
# Server at http://localhost:3000
# Hot reload enabled
# Debug logging active
```

### Production Mode
```bash
# Build TypeScript
npm run build

# Start production server
npm run start:prod

# Or with PM2 for process management
pm2 start dist/main.js --name npe-beach
pm2 save
pm2 startup
```

### Environment Variables
```bash
# .env file
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-strong-secret-key
LIT_NETWORK=cayenne # or 'datil-test' / 'datil-prod'

# WebAuthn Configuration
RPID=yourdomain.com
RPNAME=Your NPE Platform
ORIGIN=https://yourdomain.com
```

---

## 📖 Documentation

- **[Session Management](docs/SESSION_MANAGEMENT.md)** - Cookie-based auth architecture
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Comprehensive test procedures
- **[Browser Testing](docs/BROWSER_TESTING_GUIDE.md)** - Interactive testing guide
- **[API Reference](docs/API_REFERENCE.md)** - Complete endpoint documentation

---

## 🤝 Contributing

We welcome contributions to The Beach! Whether you're:
- 🐛 Fixing bugs
- ✨ Adding features
- 📚 Improving documentation
- 🧪 Writing tests
- 🎨 Enhancing the XR environment
- 🤖 Developing new AI agent patterns

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📋 Roadmap

### Q1 2025
- ✅ WebAuthn biometric authentication
- ✅ Lit Protocol PKP integration
- ✅ Sub-PKP minting for multi-agent deployment
- ✅ Tropical XR environment with multiplayer
- ✅ MVC architecture with session management

### Q2 2025
- 🔄 Advanced AI agent orchestration
- 🔄 Agent marketplace for pre-built NPE services
- 🔄 Enhanced transaction & payment flows
- 🔄 Multi-language agent support
- 🔄 Voice interaction for agents

### Q3 2025
- 🔄 Mobile XR support (iOS/Android)
- 🔄 Agent-to-agent negotiation protocols
- 🔄 Decentralized agent reputation system
- 🔄 Integration with major DeFi protocols
- 🔄 White-label NPE platform for enterprises

### Q4 2025
- 🔄 Cross-platform agent portability
- 🔄 Advanced analytics dashboard
- 🔄 Agent training & fine-tuning tools
- 🔄 Regulatory compliance frameworks
- 🔄 Global NPE marketplace launch

---

## 💡 Why The Beach for NPEs?

### Traditional AI Chatbots
- ❌ Single agent, limited capabilities
- ❌ No cryptographic identity
- ❌ Can't handle payments
- ❌ No persistent presence
- ❌ Limited to text chat
- ❌ No multi-agent coordination

### The Beach NPE Platform
- ✅ Unlimited specialized agents
- ✅ Each agent has unique PKP & wallet
- ✅ Autonomous transaction capabilities
- ✅ 24/7 persistent XR presence
- ✅ Immersive 3D environment
- ✅ Multi-agent swarm intelligence

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Babylon.js** - WebXR rendering engine
- **Lit Protocol** - PKP cryptographic infrastructure
- **SimpleWebAuthn** - Biometric authentication
- **NestJS** - Backend framework
- **Socket.IO** - Real-time communication
- **The open source community** - For making this possible

---

<p align="center">
  <strong>Built with ❤️ for the future of autonomous digital agents</strong><br>
  🏝️ The Beach - Where NPEs Thrive 🤖
</p>
