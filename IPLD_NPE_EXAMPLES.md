# IPLD + NPE Examples: Everything Working Together

**Practical examples showing all NPE features with IPFS/IPLD**

---

## 🎯 Quick Reference

All NPE systems now support IPLD content-addressing:

```typescript
// Every data object gets a CID (Content Identifier)
const productCID = await ipldService.createProductCID({...});    // VR Marketplace
const agentCID = await ipldService.createAgentCID({...});         // Digital Agents
const purchaseCID = await ipldService.createPurchaseCID({...});   // Purchases
const logCID = await ipldService.createLogCID({...});             // Log Marketplace
const testCID = await ipldService.createTestResultCID({...});     // AI Testing

// Resolve any CID to get original data
const data = await ipldService.resolve(cid);

// Verify data integrity
const isValid = await ipldService.verifyNodeIntegrity(cid);
```

---

## 📦 Example 1: VR Marketplace with IPLD

### Create Product with Content-Addressable Identity

```typescript
// POST /marketplace/products

import { IpldService } from '../lit-compute/services/ipld.service';

@Injectable()
export class VRCodeMarketplaceService {
  constructor(
    private readonly ipldService: IpldService,
  ) {}
  
  async createProduct(data: {
    name: string;
    category: string;
    pricing: { starter: number; pro: number; enterprise: number };
    features: string[];
    files: string[];
  }) {
    const productId = `product-${Date.now()}`;
    
    // Create IPLD CID for product
    const cid = await this.ipldService.createProductCID({
      id: productId,
      name: data.name,
      pricing: data.pricing,
      files: data.files,
      features: data.features,
      timestamp: Date.now(),
    });
    
    const product = {
      id: productId,
      ...data,
      cid,                              // Content ID
      ipldAddress: `/ipld/${cid}`,      // IPLD address
      vrPosition: { x: 0, y: 1.5, z: -3 },
      rating: 0,
      totalSales: 0,
    };
    
    this.products.set(productId, product);
    
    return {
      success: true,
      productId,
      cid,
      ipldAddress: `/ipld/${cid}`,
      message: 'Product created with IPLD identity'
    };
  }
}
```

**API Usage:**

```bash
# Create product
curl -X POST http://localhost:3000/marketplace/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Agent Bundle",
    "category": "bundle",
    "pricing": { "starter": 299, "pro": 999, "enterprise": 4999 },
    "features": ["5 AI agents", "VR interface", "API access"],
    "files": ["bundle.zip", "docs.pdf"]
  }'

# Response:
{
  "success": true,
  "productId": "product-1704891234567",
  "cid": "zQmXg9Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VW",
  "ipldAddress": "/ipld/zQmXg9Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VW",
  "message": "Product created with IPLD identity"
}

# Verify product via IPLD
curl http://localhost:3000/lit-compute/ipld/resolve/zQmXg9Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VW

# Response:
{
  "id": "product-1704891234567",
  "name": "AI Agent Bundle",
  "pricing": { "starter": 299, "pro": 999, "enterprise": 4999 },
  "files": ["bundle.zip", "docs.pdf"],
  "features": ["5 AI agents", "VR interface", "API access"],
  "timestamp": 1704891234567
}
```

---

## 🛒 Example 2: Purchase with Cryptographic Verification

### Immutable Purchase Records

```typescript
async createPurchase(data: {
  productId: string;
  tier: 'starter' | 'pro' | 'enterprise';
  customerEmail: string;
}) {
  const product = this.products.get(data.productId);
  const purchaseId = `purchase-${Date.now()}`;
  const licenseKey = this.generateLicenseKey(data.productId, data.tier);
  
  // Create IPLD CID for purchase
  const purchaseCID = await this.ipldService.createPurchaseCID({
    purchaseId,
    productId: data.productId,
    licenseKey,
    customerEmail: data.customerEmail,
    amount: product.pricing[data.tier],
    timestamp: Date.now(),
  });
  
  const purchase = {
    id: purchaseId,
    productId: data.productId,
    productCID: product.cid,          // Link to product CID
    cid: purchaseCID,                  // Purchase CID
    ipldAddress: `/ipld/${purchaseCID}`,
    tier: data.tier,
    customerEmail: data.customerEmail,
    licenseKey,
    amount: product.pricing[data.tier],
    purchasedAt: new Date(),
    status: 'completed',
  };
  
  this.purchases.set(purchaseId, purchase);
  
  return {
    success: true,
    purchaseId,
    purchaseCID,
    productCID: product.cid,
    licenseKey,
    downloadUrl: `ipfs://${product.cid}/files`,  // IPFS download
  };
}
```

**API Usage:**

```bash
# Purchase product
curl -X POST http://localhost:3000/marketplace/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-1704891234567",
    "tier": "pro",
    "customerEmail": "customer@example.com"
  }'

# Response:
{
  "success": true,
  "purchaseId": "purchase-1704891245678",
  "purchaseCID": "zQmYh3Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VX",
  "productCID": "zQmXg9Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VW",
  "licenseKey": "PRO-BUNDLE-2024-XYZ789",
  "downloadUrl": "ipfs://zQmXg9Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VW/files"
}

# Verify purchase
curl http://localhost:3000/lit-compute/ipld/verify \
  -H "Content-Type: application/json" \
  -d '{
    "cid": "zQmYh3Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VX"
  }'

# Response:
{
  "valid": true,
  "cid": "zQmYh3Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VX",
  "data": {
    "purchaseId": "purchase-1704891245678",
    "productId": "product-1704891234567",
    "licenseKey": "PRO-BUNDLE-2024-XYZ789",
    "customerEmail": "customer@example.com",
    "amount": 999,
    "timestamp": 1704891245678
  }
}
```

---

## 🤖 Example 3: Digital Agents with IPLD

### AI Agents as Content-Addressable Entities

```typescript
async createDigitalAgent(config: {
  tier: 'free' | 'pro' | 'enterprise';
  agentType: 'code-generator' | 'tester' | 'reviewer';
  name: string;
}) {
  const agentId = `agent-${Date.now()}`;
  
  // Create IPLD CID for agent
  const agentCID = await this.ipldService.createAgentCID({
    id: agentId,
    tier: config.tier,
    agentType: config.agentType,
    trainingData: [],
    capabilities: this.getCapabilitiesForTier(config.tier),
    timestamp: Date.now(),
  });
  
  const agent = {
    id: agentId,
    cid: agentCID,
    ipldAddress: `/ipld/${agentCID}`,
    tier: config.tier,
    agentType: config.agentType,
    name: config.name,
    trainingData: [],
    capabilities: this.getCapabilitiesForTier(config.tier),
    metrics: {
      totalBuilds: 0,
      successfulBuilds: 0,
      averageQuality: 0,
    },
    createdAt: new Date(),
  };
  
  this.agents.set(agentId, agent);
  
  return {
    success: true,
    agentId,
    agentCID,
    ipldAddress: `/ipld/${agentCID}`,
  };
}
```

**API Usage:**

```bash
# Create digital agent
curl -X POST http://localhost:3000/agents/create \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "pro",
    "agentType": "code-generator",
    "name": "CodeWizard AI"
  }'

# Response:
{
  "success": true,
  "agentId": "agent-1704891256789",
  "agentCID": "zQmZi4Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VY",
  "ipldAddress": "/ipld/zQmZi4Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VY"
}

# Train agent (creates new version with updated CID)
curl -X POST http://localhost:3000/agents/agent-1704891256789/train \
  -H "Content-Type: application/json" \
  -d '{
    "examples": [
      {"input": "Create a user model", "output": "class User { ... }"}
    ]
  }'

# Response:
{
  "success": true,
  "agentId": "agent-1704891256789",
  "previousCID": "zQmZi4Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VY",
  "newCID": "zQmAj5Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VZ",
  "trainingExamples": 1,
  "message": "Agent trained, new version created"
}

# View agent version history
curl http://localhost:3000/agents/agent-1704891256789/versions

# Response:
[
  {
    "version": 1,
    "cid": "zQmZi4Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VY",
    "trainingData": [],
    "createdAt": "2024-01-10T10:00:56.789Z"
  },
  {
    "version": 2,
    "cid": "zQmAj5Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VZ",
    "trainingData": [{"input": "...", "output": "..."}],
    "createdAt": "2024-01-10T10:05:12.345Z"
  }
]
```

---

## 📊 Example 4: Log Marketplace with Content Addressing

### Immutable, Verifiable Logs

```typescript
async analyzeLogEntry(log: {
  stage: string;
  message: string;
  metadata?: any;
}) {
  const logId = `log-${Date.now()}`;
  
  // AI analysis (existing code)
  const quality = await this.analyzeQuality(log);
  const payment = this.calculatePayment(quality);
  
  // Create IPLD CID for log entry
  const logCID = await this.ipldService.createLogCID({
    stage: log.stage,
    message: log.message,
    metadata: log.metadata || {},
    quality: quality.overall,
    payment: payment.amount,
    timestamp: Date.now(),
  });
  
  const analysis = {
    logId,
    cid: logCID,
    ipldAddress: `/ipld/${logCID}`,
    stage: log.stage,
    message: log.message,
    metadata: log.metadata || {},
    quality,
    payment,
    timestamp: new Date(),
  };
  
  this.logAnalyses.set(logId, analysis);
  
  return {
    success: true,
    logId,
    logCID,
    quality: quality.overall,
    paymentAmount: payment.amount,
  };
}
```

**API Usage:**

```bash
# Submit log for analysis
curl -X POST http://localhost:3000/logs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "build",
    "message": "Compiled successfully in 2.3s",
    "metadata": {
      "buildTime": 2300,
      "files": 45,
      "warnings": 0
    }
  }'

# Response:
{
  "success": true,
  "logId": "log-1704891267890",
  "logCID": "zQmBk6Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VA",
  "quality": 95.5,
  "paymentAmount": 0.0478
}

# Verify log authenticity
curl http://localhost:3000/lit-compute/ipld/resolve/zQmBk6Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VA

# Response (proves log hasn't been tampered with):
{
  "stage": "build",
  "message": "Compiled successfully in 2.3s",
  "metadata": {
    "buildTime": 2300,
    "files": 45,
    "warnings": 0
  },
  "quality": 95.5,
  "payment": 0.0478,
  "timestamp": 1704891267890
}

# Build audit trail (multiple logs linked via IPLD)
curl http://localhost:3000/logs/audit-trail?projectId=xyz

# Response:
{
  "projectId": "xyz",
  "totalLogs": 156,
  "dagRoot": "zQmCl7Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VB",
  "logs": [
    { "cid": "zQm...", "stage": "build", "quality": 95.5, "timestamp": "..." },
    { "cid": "zQm...", "stage": "test", "quality": 98.2, "timestamp": "..." },
    { "cid": "zQm...", "stage": "deploy", "quality": 99.1, "timestamp": "..." }
  ],
  "ipfsUrl": "ipfs://zQmCl7Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VB"
}
```

---

## 🧪 Example 5: AI Testing with Verifiable Results

### Cryptographic Proof of Test Results

```typescript
async runAITest(params: {
  code: string;
  testType: 'quality' | 'performance' | 'security';
  agentId: string;
}) {
  const testId = `test-${Date.now()}`;
  
  // Run AI test (existing code)
  const result = await this.runTest(params);
  
  // Create IPLD CID for test result
  const testCID = await this.ipldService.createTestResultCID({
    testId,
    code: params.code,
    qualityScore: result.score,
    revenueImpact: result.revenueImpact,
    recommendation: result.recommendation,
    timestamp: Date.now(),
  });
  
  const testResult = {
    testId,
    cid: testCID,
    ipldAddress: `/ipld/${testCID}`,
    agentId: params.agentId,
    testType: params.testType,
    score: result.score,
    revenueImpact: result.revenueImpact,
    recommendation: result.recommendation,
    timestamp: new Date(),
  };
  
  this.testResults.set(testId, testResult);
  
  return {
    success: true,
    testId,
    testCID,
    score: result.score,
    revenueImpact: result.revenueImpact,
  };
}
```

**API Usage:**

```bash
# Run AI test
curl -X POST http://localhost:3000/ai-testing/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) { return a + b; }",
    "testType": "quality",
    "agentId": "agent-1704891256789"
  }'

# Response:
{
  "success": true,
  "testId": "test-1704891278901",
  "testCID": "zQmDm8Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VC",
  "score": 87.5,
  "revenueImpact": 1250.00
}

# Verify test result (cryptographic proof)
curl http://localhost:3000/lit-compute/ipld/verify \
  -H "Content-Type: application/json" \
  -d '{
    "cid": "zQmDm8Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VC"
  }'

# Response:
{
  "valid": true,
  "cid": "zQmDm8Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VC",
  "data": {
    "testId": "test-1704891278901",
    "code": "function add(a, b) { return a + b; }",
    "qualityScore": 87.5,
    "revenueImpact": 1250.00,
    "recommendation": "Add input validation",
    "timestamp": 1704891278901
  }
}
```

---

## 🔗 Example 6: DAG Linking Across Systems

### Building Verifiable Data Chains

```typescript
/**
 * Example: Link product → purchase → license → download
 * Creates a DAG (Directed Acyclic Graph) of related data
 */

// 1. Create product
const productCID = await ipldService.createProductCID({ ... });

// 2. Create purchase (links to product)
const purchaseCID = await ipldService.createPurchaseCID({
  purchaseId: 'purchase-123',
  productId: 'product-456',
  productCID: productCID,  // DAG link
  licenseKey: 'PRO-XYZ789',
  customerEmail: 'customer@example.com',
  amount: 999,
  timestamp: Date.now(),
});

// 3. Create license activation (links to purchase)
const activationCID = await ipldService.createActivationCID({
  activationId: 'activation-789',
  purchaseId: 'purchase-123',
  purchaseCID: purchaseCID,  // DAG link
  deviceId: 'device-abc',
  timestamp: Date.now(),
});

// 4. Create download record (links to activation)
const downloadCID = await ipldService.createDownloadCID({
  downloadId: 'download-012',
  activationId: 'activation-789',
  activationCID: activationCID,  // DAG link
  ipAddress: '192.168.1.1',
  timestamp: Date.now(),
});

// Result: product → purchase → activation → download
// Complete audit trail via IPLD!
```

**API Usage:**

```bash
# Get complete DAG for a purchase
curl http://localhost:3000/marketplace/purchase/purchase-123/dag

# Response:
{
  "purchaseId": "purchase-123",
  "purchaseCID": "zQmYh3...",
  "dag": {
    "product": {
      "cid": "zQmXg9...",
      "name": "AI Agent Bundle",
      "pricing": { "pro": 999 }
    },
    "purchase": {
      "cid": "zQmYh3...",
      "amount": 999,
      "licenseKey": "PRO-XYZ789",
      "timestamp": 1704891245678
    },
    "activations": [
      {
        "cid": "zQmZi4...",
        "deviceId": "device-abc",
        "timestamp": 1704891250000
      }
    ],
    "downloads": [
      {
        "cid": "zQmAj5...",
        "ipAddress": "192.168.1.1",
        "timestamp": 1704891255000
      }
    ]
  },
  "ipfsUrl": "ipfs://zQmYh3.../dag"
}
```

---

## 🌐 Example 7: Export to IPFS

### Distribute Data Globally

```typescript
/**
 * Export any NPE data to IPFS for global distribution
 */

// Export product to IPFS
const exportResult = await ipldService.exportBlock(productCID);

console.log(`Product exported to IPFS: ipfs://${exportResult.cid}`);
console.log(`Public gateway: https://ipfs.io/ipfs/${exportResult.cid}`);

// Import from IPFS
const importedData = await ipldService.importBlock(productCID);
console.log('Product data retrieved from IPFS:', importedData);
```

**API Usage:**

```bash
# Export to IPFS
curl -X POST http://localhost:3000/lit-compute/ipld/export/zQmXg9Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VW

# Response:
{
  "success": true,
  "cid": "zQmXg9Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VW",
  "ipfsUrl": "ipfs://zQmXg9Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VW",
  "gatewayUrl": "https://ipfs.io/ipfs/zQmXg9Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VW",
  "size": 2048,
  "message": "Block exported to IPFS"
}

# Access via public IPFS gateway
curl https://ipfs.io/ipfs/zQmXg9Pp2ytZ62HQ1ob96XLjyVH8RhBg2iLVzD9zv9z8VW

# Response (the actual product data):
{
  "id": "product-1704891234567",
  "name": "AI Agent Bundle",
  "pricing": { "starter": 299, "pro": 999, "enterprise": 4999 },
  "files": ["bundle.zip", "docs.pdf"],
  "features": ["5 AI agents", "VR interface", "API access"],
  "timestamp": 1704891234567
}
```

---

## ✅ Complete Workflow Example

### From Creation to IPFS Distribution

```bash
# 1. Create product with IPLD
curl -X POST http://localhost:3000/marketplace/products \
  -d '{"name": "My Product", "pricing": {...}}'
# → productCID: zQmXg9...

# 2. Purchase product
curl -X POST http://localhost:3000/marketplace/purchase \
  -d '{"productId": "...", "tier": "pro"}'
# → purchaseCID: zQmYh3...

# 3. Verify purchase
curl http://localhost:3000/lit-compute/ipld/verify \
  -d '{"cid": "zQmYh3..."}'
# → valid: true

# 4. Export to IPFS
curl -X POST http://localhost:3000/lit-compute/ipld/export/zQmXg9...
# → ipfsUrl: ipfs://zQmXg9...

# 5. Download from IPFS (works anywhere!)
curl https://ipfs.io/ipfs/zQmXg9...
# → product data retrieved from distributed network
```

---

## 🎉 Summary

**All NPE features now have IPLD superpowers:**

✅ **VR Marketplace** - Products, purchases, licenses all content-addressable  
✅ **Digital Agents** - AI agents with verifiable identities and version history  
✅ **AI Testing** - Cryptographic proof of test results  
✅ **Log Marketplace** - Immutable audit trails  
✅ **NPE Auth** - PKP-linked CIDs for authentication  
✅ **Game Manager** - Achievement DAGs  

**Benefits:**
- 🔒 **Tamper-proof** - Data integrity guaranteed by cryptography
- 🌐 **Global CDN** - IPFS provides worldwide distribution
- 📊 **Audit trails** - Complete DAG history
- ⚡ **Deduplication** - Same content = same CID
- 🚀 **Scalable** - Peer-to-peer distribution

**Everything works together with IPFS/IPLD included!** 🎯
