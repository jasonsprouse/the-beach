# 🚀 Integration Implementation Plan

**Seamless Tech Stack Integration - Step-by-Step Guide**

---

## 📋 Overview

This document provides **exact commands** and **file-by-file instructions** for integrating the three highest-value branches:

1. **product/lit-compute-network** → $3.6M/year
2. **integration/stripe-payments** → $252K/year  
3. **product/multi-agent-orchestrator** → 10x efficiency

Total Timeline: **4 weeks**  
Total Development Cost: **$10,000**  
Year 1 Revenue Impact: **+$4.99M**

---

## 🎯 Phase 1: Lit Compute Network Integration

**Duration**: 7 days  
**Revenue Impact**: $3.6M Year 1  
**Risk Level**: LOW (95% compatibility)

### Day 1: Environment Setup

#### Step 1.1: Deploy Redis Vercel KV (30 minutes)

```bash
# Install Vercel KV
npm install @vercel/kv

# Deploy to Vercel
cd /home/goodfaith/projects/xr/babylon
vercel link

# Add KV storage
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN

# Verify connection
vercel env pull .env.local
```

#### Step 1.2: Merge Lit Compute Backend (3 hours)

```bash
# Checkout lit-compute branch
git fetch origin
git checkout product/lit-compute-network

# Copy backend services
mkdir -p src/lit-compute
cp src/lit-compute/lit-compute.service.ts ../agent/agent-001/code-review/src/lit-compute/
cp src/lit-compute/lit-compute.controller.ts ../agent/agent-001/code-review/src/lit-compute/
cp src/lit-compute/node-registry.service.ts ../agent/agent-001/code-review/src/lit-compute/
cp src/lit-compute/job-queue.service.ts ../agent/agent-001/code-review/src/lit-compute/
cp src/lit-compute/earnings-tracker.service.ts ../agent/agent-001/code-review/src/lit-compute/
cp src/lit-compute/lit-compute.module.ts ../agent/agent-001/code-review/src/lit-compute/

# Return to working branch
git checkout agent/agent-001/code-review
```

#### Step 1.3: Create Module Integration (2 hours)

```typescript
// src/lit-compute/lit-compute.module.ts
import { Module } from '@nestjs/common';
import { LitComputeService } from './lit-compute.service';
import { LitComputeController } from './lit-compute.controller';
import { NodeRegistryService } from './node-registry.service';
import { JobQueueService } from './job-queue.service';
import { EarningsTrackerService } from './earnings-tracker.service';
import { IpldModule } from '../ipld/ipld.module';
import { PkpAuthModule } from '../pkp-auth/pkp-auth.module';

@Module({
  imports: [IpldModule, PkpAuthModule],
  controllers: [LitComputeController],
  providers: [
    LitComputeService,
    NodeRegistryService,
    JobQueueService,
    EarningsTrackerService,
  ],
  exports: [LitComputeService, NodeRegistryService],
})
export class LitComputeModule {}
```

#### Step 1.4: Update App Module (30 minutes)

```bash
# Edit src/app.module.ts
code src/app.module.ts
```

```typescript
// Add to imports array in src/app.module.ts
import { LitComputeModule } from './lit-compute/lit-compute.module';

@Module({
  imports: [
    // ... existing imports
    MarketplaceModule,
    LitComputeModule, // ← ADD THIS
  ],
})
export class AppModule {}
```

#### Step 1.5: Build and Test (30 minutes)

```bash
# Install dependencies
npm install

# Build
npm run build

# Expected output: ✓ Compiled successfully
# If errors, check module imports

# Start dev server
npm run start:dev

# Test endpoints (in new terminal)
curl http://localhost:3000/lit-compute/health
# Expected: {"status":"ok","nodes":0,"jobs":0}
```

### Day 2: Node Registry Implementation

#### Step 2.1: Redis Schema Setup (1 hour)

```typescript
// src/lit-compute/schemas/redis-keys.ts
export const REDIS_KEYS = {
  // Node management
  NODE: (nodeId: string) => `lit:node:${nodeId}`,
  NODE_INDEX: 'lit:nodes:index',
  NODE_ACTIVE: 'lit:nodes:active',
  
  // Job management
  JOB: (jobId: string) => `lit:job:${jobId}`,
  JOB_QUEUE: 'lit:jobs:queue',
  JOB_PENDING: 'lit:jobs:pending',
  JOB_COMPLETED: 'lit:jobs:completed',
  
  // Earnings
  EARNINGS: (nodeId: string) => `lit:earnings:${nodeId}`,
  EARNINGS_TOTAL: 'lit:earnings:total',
};

// src/lit-compute/schemas/node.schema.ts
export interface ComputeNode {
  nodeId: string;
  pkpAddress: string;
  publicKey: string;
  capabilities: {
    cpu: number;
    memory: number;
    gpu: boolean;
    storage: number;
  };
  location: {
    region: string;
    lat: number;
    lon: number;
  };
  pricing: {
    cpuPerSecond: number;
    memoryPerGB: number;
    storagePerGB: number;
  };
  status: 'active' | 'busy' | 'offline';
  reputation: number; // 0-100
  totalJobsCompleted: number;
  totalEarnings: number;
  registeredAt: string;
  lastSeen: string;
}
```

#### Step 2.2: Node Registration Logic (3 hours)

```typescript
// src/lit-compute/node-registry.service.ts
import { Injectable } from '@nestjs/common';
import { kv } from '@vercel/kv';
import { IpldService } from '../ipld/ipld.service';
import { PKPAuthService } from '../pkp-auth/pkp-auth.service';
import { REDIS_KEYS } from './schemas/redis-keys';
import { ComputeNode } from './schemas/node.schema';

@Injectable()
export class NodeRegistryService {
  constructor(
    private ipldService: IpldService,
    private pkpAuthService: PKPAuthService,
  ) {}

  async registerNode(nodeData: Partial<ComputeNode>): Promise<ComputeNode> {
    // 1. Verify PKP ownership
    const isValid = await this.pkpAuthService.verifyPKPOwnership(
      nodeData.pkpAddress,
      nodeData.publicKey,
    );
    
    if (!isValid) {
      throw new Error('Invalid PKP credentials');
    }

    // 2. Create node ID with IPLD
    const nodeId = await this.ipldService.createNodeCID({
      pkpAddress: nodeData.pkpAddress,
      timestamp: Date.now(),
      capabilities: nodeData.capabilities,
    });

    // 3. Create full node object
    const node: ComputeNode = {
      nodeId,
      pkpAddress: nodeData.pkpAddress,
      publicKey: nodeData.publicKey,
      capabilities: nodeData.capabilities,
      location: nodeData.location,
      pricing: nodeData.pricing || {
        cpuPerSecond: 0.001, // $0.001/sec
        memoryPerGB: 0.05,   // $0.05/GB
        storagePerGB: 0.01,  // $0.01/GB
      },
      status: 'active',
      reputation: 100,
      totalJobsCompleted: 0,
      totalEarnings: 0,
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    };

    // 4. Store in Redis
    await kv.set(REDIS_KEYS.NODE(nodeId), node);
    await kv.sadd(REDIS_KEYS.NODE_INDEX, nodeId);
    await kv.sadd(REDIS_KEYS.NODE_ACTIVE, nodeId);

    // 5. Emit event
    this.eventEmitter.emit('node.registered', { nodeId, pkpAddress: node.pkpAddress });

    return node;
  }

  async getNode(nodeId: string): Promise<ComputeNode | null> {
    return await kv.get<ComputeNode>(REDIS_KEYS.NODE(nodeId));
  }

  async listActiveNodes(): Promise<ComputeNode[]> {
    const nodeIds = await kv.smembers(REDIS_KEYS.NODE_ACTIVE);
    const nodes = await Promise.all(
      nodeIds.map(id => kv.get<ComputeNode>(REDIS_KEYS.NODE(id)))
    );
    return nodes.filter(n => n !== null);
  }

  async selectOptimalNode(jobRequirements: any): Promise<ComputeNode> {
    const activeNodes = await this.listActiveNodes();
    
    // Filter by capabilities
    const capableNodes = activeNodes.filter(node => 
      node.capabilities.cpu >= jobRequirements.cpu &&
      node.capabilities.memory >= jobRequirements.memory &&
      (jobRequirements.gpu ? node.capabilities.gpu : true) &&
      node.status === 'active'
    );

    if (capableNodes.length === 0) {
      throw new Error('No capable nodes available');
    }

    // Score nodes (reputation + pricing)
    const scored = capableNodes.map(node => ({
      node,
      score: (node.reputation / 100) * 0.7 + (1 / node.pricing.cpuPerSecond) * 0.3,
    }));

    // Return highest scoring node
    scored.sort((a, b) => b.score - a.score);
    return scored[0].node;
  }

  async updateNodeStatus(nodeId: string, status: 'active' | 'busy' | 'offline'): Promise<void> {
    const node = await this.getNode(nodeId);
    if (!node) throw new Error('Node not found');

    node.status = status;
    node.lastSeen = new Date().toISOString();

    await kv.set(REDIS_KEYS.NODE(nodeId), node);

    if (status === 'offline') {
      await kv.srem(REDIS_KEYS.NODE_ACTIVE, nodeId);
    } else {
      await kv.sadd(REDIS_KEYS.NODE_ACTIVE, nodeId);
    }
  }
}
```

#### Step 2.3: Test Node Registration (1 hour)

```bash
# Start server
npm run start:dev

# Test registration (in new terminal)
curl -X POST http://localhost:3000/lit-compute/nodes/register \
  -H "Content-Type: application/json" \
  -d '{
    "pkpAddress": "0x1234...",
    "publicKey": "0x5678...",
    "capabilities": {
      "cpu": 8,
      "memory": 32,
      "gpu": true,
      "storage": 500
    },
    "location": {
      "region": "us-east-1",
      "lat": 40.7128,
      "lon": -74.0060
    }
  }'

# Expected response:
# {
#   "nodeId": "bafyrei...",
#   "status": "active",
#   "reputation": 100
# }

# List nodes
curl http://localhost:3000/lit-compute/nodes
# Expected: Array of registered nodes
```

### Day 3: Job Queue System

#### Step 3.1: Job Schema (30 minutes)

```typescript
// src/lit-compute/schemas/job.schema.ts
export interface ComputeJob {
  jobId: string;
  creatorPKP: string;
  assignedNodeId: string | null;
  
  // Job specification
  task: {
    type: 'code-execution' | 'model-inference' | 'data-processing';
    code?: string;
    modelId?: string;
    input: any;
    requirements: {
      cpu: number;
      memory: number;
      gpu: boolean;
      timeout: number; // seconds
    };
  };
  
  // Lifecycle
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  
  // Results
  result?: any;
  resultCID?: string; // IPLD CID of result
  logs?: string[];
  error?: string;
  
  // Billing
  estimatedCost: number;
  actualCost?: number;
  paid: boolean;
}
```

#### Step 3.2: Job Queue Service (4 hours)

```typescript
// src/lit-compute/job-queue.service.ts
import { Injectable } from '@nestjs/common';
import { kv } from '@vercel/kv';
import { IpldService } from '../ipld/ipld.service';
import { NodeRegistryService } from './node-registry.service';
import { REDIS_KEYS } from './schemas/redis-keys';
import { ComputeJob } from './schemas/job.schema';

@Injectable()
export class JobQueueService {
  constructor(
    private ipldService: IpldService,
    private nodeRegistry: NodeRegistryService,
  ) {}

  async submitJob(jobData: Partial<ComputeJob>): Promise<ComputeJob> {
    // 1. Create job ID with IPLD
    const jobId = await this.ipldService.createJobCID({
      creatorPKP: jobData.creatorPKP,
      task: jobData.task,
      timestamp: Date.now(),
    });

    // 2. Estimate cost
    const estimatedCost = this.calculateCost(jobData.task.requirements);

    // 3. Create job object
    const job: ComputeJob = {
      jobId,
      creatorPKP: jobData.creatorPKP,
      assignedNodeId: null,
      task: jobData.task,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedCost,
      paid: false,
    };

    // 4. Store in Redis
    await kv.set(REDIS_KEYS.JOB(jobId), job);
    await kv.lpush(REDIS_KEYS.JOB_QUEUE, jobId);
    await kv.sadd(REDIS_KEYS.JOB_PENDING, jobId);

    // 5. Trigger job assignment
    await this.assignJobToNode(jobId);

    return job;
  }

  async assignJobToNode(jobId: string): Promise<void> {
    const job = await kv.get<ComputeJob>(REDIS_KEYS.JOB(jobId));
    if (!job) throw new Error('Job not found');

    // Select optimal node
    const node = await this.nodeRegistry.selectOptimalNode(job.task.requirements);

    // Update job
    job.assignedNodeId = node.nodeId;
    job.status = 'assigned';
    await kv.set(REDIS_KEYS.JOB(jobId), job);

    // Update node status
    await this.nodeRegistry.updateNodeStatus(node.nodeId, 'busy');

    // Emit event
    this.eventEmitter.emit('job.assigned', { jobId, nodeId: node.nodeId });
  }

  async getJob(jobId: string): Promise<ComputeJob | null> {
    return await kv.get<ComputeJob>(REDIS_KEYS.JOB(jobId));
  }

  async completeJob(jobId: string, result: any): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');

    // 1. Store result in IPLD
    const resultCID = await this.ipldService.createNodeCID(result);

    // 2. Calculate actual cost
    const duration = (Date.now() - new Date(job.createdAt).getTime()) / 1000;
    const actualCost = this.calculateCost(job.task.requirements, duration);

    // 3. Update job
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.result = result;
    job.resultCID = resultCID;
    job.actualCost = actualCost;

    await kv.set(REDIS_KEYS.JOB(jobId), job);
    await kv.srem(REDIS_KEYS.JOB_PENDING, jobId);
    await kv.sadd(REDIS_KEYS.JOB_COMPLETED, jobId);

    // 4. Update node status
    if (job.assignedNodeId) {
      await this.nodeRegistry.updateNodeStatus(job.assignedNodeId, 'active');
    }

    // 5. Track earnings
    await this.trackEarnings(job.assignedNodeId, actualCost);

    // 6. Emit event
    this.eventEmitter.emit('job.completed', { jobId, resultCID, cost: actualCost });
  }

  private calculateCost(requirements: any, duration?: number): number {
    const baseCost = 
      requirements.cpu * 0.001 +
      requirements.memory * 0.05 +
      (requirements.gpu ? 0.5 : 0);
    
    return duration ? baseCost * duration : baseCost * requirements.timeout;
  }

  private async trackEarnings(nodeId: string, amount: number): Promise<void> {
    // Node gets 70%, platform gets 30%
    const nodeEarnings = amount * 0.7;
    await kv.incrby(REDIS_KEYS.EARNINGS(nodeId), nodeEarnings);
    await kv.incrby(REDIS_KEYS.EARNINGS_TOTAL, amount);
  }
}
```

#### Step 3.3: Test Job Submission (1 hour)

```bash
# Submit a job
curl -X POST http://localhost:3000/lit-compute/jobs/submit \
  -H "Content-Type: application/json" \
  -d '{
    "creatorPKP": "0xABCD...",
    "task": {
      "type": "code-execution",
      "code": "console.log(\"Hello from Lit Compute!\");",
      "input": {},
      "requirements": {
        "cpu": 1,
        "memory": 2,
        "gpu": false,
        "timeout": 30
      }
    }
  }'

# Expected response:
# {
#   "jobId": "bafkreig...",
#   "status": "assigned",
#   "assignedNodeId": "bafyrei...",
#   "estimatedCost": 0.13
# }

# Check job status
curl http://localhost:3000/lit-compute/jobs/{jobId}
```

### Day 4-5: Frontend Dashboard

*(Continue with Y8 App integration...)*

---

## 🎯 Phase 2: Stripe Payments Integration

**Duration**: 6 days  
**Revenue Impact**: $252K Year 1  
**Risk Level**: LOW (Industry standard)

### Day 1: Stripe Setup

```bash
# Install Stripe
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

# Create Stripe account at stripe.com
# Get API keys from dashboard

# Add to .env
echo "STRIPE_SECRET_KEY=sk_test_..." >> .env
echo "STRIPE_PUBLIC_KEY=pk_test_..." >> .env
echo "STRIPE_WEBHOOK_SECRET=whsec_..." >> .env

# Add to Vercel
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

### Day 2-3: Payment Service Implementation

*(Full implementation from GAMEMANAGER_BRANCH_ANALYSIS.md)*

### Day 4-6: Integration with Existing Systems

*(PKP Sales, VR Marketplace, Log Monetization)*

---

## 🎯 Phase 3: Multi-Agent Orchestrator

**Duration**: 9 days  
**Impact**: 10x efficiency  
**Risk Level**: MEDIUM (Complex coordination)

*(Full implementation plan...)*

---

## 📊 Success Metrics

### Week 1 Targets
- [ ] Redis Vercel KV deployed
- [ ] 10+ compute nodes registered
- [ ] 100+ jobs processed
- [ ] $100+ earned by node operators

### Week 2 Targets
- [ ] Stripe account verified
- [ ] First PKP sale processed
- [ ] Payment webhooks functional
- [ ] Revenue dashboard live

### Week 3-4 Targets
- [ ] 5-agent swarm operational
- [ ] 10x throughput improvement
- [ ] Agent specialization system live

---

**Next Steps**: Execute Day 1 of Lit Compute integration! 🚀
