# Freemium Digital Agents - Quickstart Guide

**AI Agents that Autonomously Build Projects from Your GitHub Repos!**

---

## What You'll Build

A **freemium NPE agent system** where Sub-PKPs are **digital AI agents** that use advanced training techniques to autonomously build projects from:
- `jasonsprouse/y8-app` (React/Next.js gaming platform)
- `jasonsprouse/the-beach` (NestJS backend with PKP system)

**Freemium Tiers**:
- 🆓 **FREE**: 10 agents, 100 builds/month, 70% accuracy
- 💎 **PRO**: 50 agents, unlimited builds, 90% accuracy  
- 🏆 **ENTERPRISE**: Unlimited agents, 98% accuracy, custom training

---

## 5-Minute Quick Start

### Step 1: View Available Tiers (30 seconds)

```bash
curl http://localhost:3000/npe/digital-agents/freemium/comparison
```

**Response**:
```json
{
  "tiers": [
    {
      "name": "Free",
      "price": "$0/month",
      "agents": 10,
      "builds": 100,
      "accuracy": "70%",
      "buildTime": "5 minutes",
      "features": [
        "Basic AI agents",
        "2 GitHub repositories",
        "Prompt engineering training",
        "TypeScript & JavaScript",
        "Bug fixing capability"
      ]
    },
    {
      "name": "Pro",
      "price": "$49/month",
      "agents": 50,
      "builds": "Unlimited",
      "accuracy": "90%",
      "buildTime": "3 minutes",
      "features": [
        "Advanced AI agents",
        "Fine-tuning + RAG training",
        "Multi-language support",
        "Test generation",
        "Code refactoring"
      ]
    }
  ]
}
```

---

### Step 2: Create Your First Agent (1 minute)

**Free Tier Agent**:
```bash
curl -X POST http://localhost:3000/npe/digital-agents/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Builder",
    "type": "code-builder",
    "tier": "free",
    "repositories": ["jasonsprouse/y8-app"]
  }'
```

**Response**:
```json
{
  "id": "agent-free-1730889000",
  "name": "My First Builder",
  "type": "code-builder",
  "tier": "free",
  "training": {
    "repositories": ["jasonsprouse/y8-app"],
    "techniques": ["prompt-engineering", "few-shot"],
    "modelBase": "gpt-4",
    "accuracy": 70
  },
  "capabilities": {
    "languagesSupported": ["TypeScript", "JavaScript"],
    "frameworksSupported": ["React", "NestJS"],
    "canGenerateTests": false,
    "canDebug": true
  },
  "status": "training"
}
```

---

### Step 3: Build a Y8 App Feature (2 minutes)

```bash
curl -X POST http://localhost:3000/npe/digital-agents/demo/y8-feature \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-free-1730889000",
    "featureName": "User Favorites",
    "description": "Add ability for users to favorite games and view them in a dedicated section"
  }'
```

**Response**:
```json
{
  "id": "build-agent-free-1730889000-1730889123",
  "agentId": "agent-free-1730889000",
  "repository": "jasonsprouse/y8-app",
  "buildType": "feature",
  "requirements": {
    "description": "Add ability for users to favorite games...",
    "features": ["User Favorites"],
    "technologies": ["React", "TypeScript", "Next.js", "Tailwind"]
  },
  "steps": [
    {"step": 1, "action": "Analyze repository structure", "status": "pending"},
    {"step": 2, "action": "Review existing codebase patterns", "status": "pending"},
    {"step": 3, "action": "Generate implementation plan", "status": "pending"},
    {"step": 4, "action": "Create feature components", "status": "pending"},
    {"step": 5, "action": "Implement feature logic", "status": "pending"},
    {"step": 6, "action": "Add feature tests", "status": "pending"}
  ],
  "status": "in-progress"
}
```

---

### Step 4: Check Build Progress (30 seconds)

```bash
curl http://localhost:3000/npe/digital-agents/build/build-agent-free-1730889000-1730889123
```

**Response (completed)**:
```json
{
  "id": "build-agent-free-1730889000-1730889123",
  "status": "completed",
  "result": {
    "success": true,
    "filesCreated": [
      "src/components/FavoritesButton.tsx",
      "src/components/FavoritesList.tsx",
      "src/hooks/useFavorites.ts",
      "src/pages/favorites.tsx"
    ],
    "filesModified": [
      "src/components/GameCard.tsx",
      "src/services/api.ts"
    ],
    "linesAdded": 450,
    "linesRemoved": 50,
    "testsAdded": 0,
    "buildTime": 10,
    "qualityScore": 70
  },
  "aiAnalysis": {
    "codeQuality": 70,
    "testCoverage": 50,
    "performance": 70,
    "security": 60,
    "maintainability": 65,
    "suggestions": [
      "Consider adding more unit tests",
      "Optimize bundle size by code splitting"
    ]
  }
}
```

---

### Step 5: View Agent Dashboard (30 seconds)

```bash
curl http://localhost:3000/npe/digital-agents/agent-free-1730889000/dashboard
```

**Response**:
```json
{
  "agent": {
    "id": "agent-free-1730889000",
    "name": "My First Builder",
    "type": "code-builder",
    "tier": "free",
    "status": "idle",
    "accuracy": 75,
    "level": 2
  },
  "stats": {
    "projectsBuilt": 1,
    "linesOfCode": 450,
    "testsWritten": 0,
    "successRate": 100,
    "avgBuildTime": 10,
    "qualityScore": 70
  },
  "recentBuilds": [
    {
      "id": "build-...",
      "repository": "jasonsprouse/y8-app",
      "buildType": "feature",
      "status": "completed",
      "success": true
    }
  ]
}
```

---

## Advanced Training

### Technique 1: Prompt Engineering (Free Tier)

```bash
curl -X POST http://localhost:3000/npe/digital-agents/agent-free-1730889000/train \
  -H "Content-Type: application/json" \
  -d '{
    "technique": "prompt-engineering"
  }'
```

**Improves accuracy by 5-15%**

### Technique 2: RAG (Pro Tier)

```bash
# Create Pro agent first
curl -X POST http://localhost:3000/npe/digital-agents/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pro Builder",
    "type": "architect",
    "tier": "pro"
  }'

# Train with RAG
curl -X POST http://localhost:3000/npe/digital-agents/agent-pro-XXX/train \
  -H "Content-Type: application/json" \
  -d '{
    "technique": "rag"
  }'
```

**Improves accuracy to 85-92%**

### Technique 3: Fine-Tuning (Enterprise Tier)

```bash
curl -X POST http://localhost:3000/npe/digital-agents/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Architect",
    "type": "architect",
    "tier": "enterprise"
  }'

curl -X POST http://localhost:3000/npe/digital-agents/agent-enterprise-XXX/train \
  -H "Content-Type: application/json" \
  -d '{
    "technique": "fine-tuning"
  }'
```

**Achieves 95-99% accuracy**

---

## Building Different Project Types

### Full Project Build

```bash
curl -X POST http://localhost:3000/npe/digital-agents/simulate/full-build \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "pro",
    "repository": "jasonsprouse/y8-app",
    "projectDescription": "Build a complete game recommendation system with user preferences and ML-based suggestions"
  }'
```

**Creates**:
- Complete project structure
- All components and services
- Routing and navigation
- Test suite
- Documentation

### Bugfix

```bash
curl -X POST http://localhost:3000/npe/digital-agents/agent-XXX/build \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "jasonsprouse/y8-app",
    "buildType": "bugfix",
    "requirements": {
      "description": "Fix infinite scroll not loading more games after page 3",
      "constraints": ["Must maintain existing pagination logic"]
    }
  }'
```

### Optimization

```bash
curl -X POST http://localhost:3000/npe/digital-agents/agent-XXX/build \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "jasonsprouse/the-beach",
    "buildType": "optimization",
    "requirements": {
      "description": "Optimize WebSocket connection handling to reduce memory usage by 50%"
    }
  }'
```

### Refactor

```bash
curl -X POST http://localhost:3000/npe/digital-agents/agent-XXX/build \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "jasonsprouse/the-beach",
    "buildType": "refactor",
    "requirements": {
      "description": "Refactor NPE service to use dependency injection instead of direct instantiation"
    }
  }'
```

---

## Training Techniques Explained

### 1. Prompt Engineering (FREE)
**How it works**: Crafts optimal prompts to guide AI behavior  
**Accuracy**: 60-75%  
**Training time**: 5 minutes  
**Examples**: 50  

**Best for**:
- Quick setup
- Simple code generation
- Pattern matching

### 2. Few-Shot Learning (FREE)
**How it works**: Provides examples to teach patterns  
**Accuracy**: 70-80%  
**Training time**: 10 minutes  
**Examples**: 75  

**Best for**:
- Learning from code examples
- Adapting to coding style
- Understanding patterns

### 3. RAG - Retrieval-Augmented Generation (PRO)
**How it works**: Accesses codebase knowledge in real-time  
**Accuracy**: 85-92%  
**Training time**: 30 minutes  
**Examples**: 200  

**Best for**:
- Context-aware generation
- Consistent with existing patterns
- Knowledge of entire codebase

### 4. Chain-of-Thought (PRO)
**How it works**: Step-by-step reasoning for complex tasks  
**Accuracy**: 88-95%  
**Training time**: 45 minutes  
**Examples**: 150  

**Best for**:
- Complex architecture decisions
- Multi-step refactoring
- Debugging difficult issues

### 5. Fine-Tuning (ENTERPRISE)
**How it works**: Custom model trained on your codebase  
**Accuracy**: 95-99%  
**Training time**: 2-4 hours  
**Examples**: 1000  

**Best for**:
- Maximum accuracy
- Specialized for your stack
- Production-ready code

---

## Agent Types

### Code Builder
**Specialization**: Creating new features and components  
**Best tier**: Free or Pro  
**Typical accuracy**: 70-90%

### Test Writer
**Specialization**: Generating comprehensive test suites  
**Best tier**: Pro  
**Typical accuracy**: 80-92%

### Debugger
**Specialization**: Finding and fixing bugs  
**Best tier**: Free or Pro  
**Typical accuracy**: 75-88%

### Optimizer
**Specialization**: Performance improvements  
**Best tier**: Pro or Enterprise  
**Typical accuracy**: 85-95%

### Architect
**Specialization**: System design and architecture  
**Best tier**: Pro or Enterprise  
**Typical accuracy**: 88-98%

### Reviewer
**Specialization**: Code review and quality assurance  
**Best tier**: Enterprise  
**Typical accuracy**: 90-98%

---

## Freemium Limits

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| **Agents** | 10 | 50 | Unlimited |
| **Builds/Month** | 100 | Unlimited | Unlimited |
| **Max Project Size** | 10K lines | 100K lines | Unlimited |
| **Concurrent Builds** | 1 | 5 | 20 |
| **API Calls/Day** | 1000 | 10,000 | Unlimited |
| **Storage** | 5GB | 100GB | 1TB |
| **Training Techniques** | 2 | 4 | 5 |
| **AI Models** | GPT-4 | GPT-4 Turbo | Claude Opus |
| **Test Generation** | ❌ | ✅ | ✅ |
| **Refactoring** | ❌ | ✅ | ✅ |
| **Architecture Design** | ❌ | ✅ | ✅ |
| **Custom Model Training** | ❌ | ❌ | ✅ |

---

## Real-World Examples

### Example 1: Build Shopping Cart for Y8 App

```bash
curl -X POST http://localhost:3000/npe/digital-agents/demo/y8-feature \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-pro-12345",
    "featureName": "Shopping Cart",
    "description": "Add shopping cart functionality with add/remove items, quantity adjustment, and checkout flow"
  }'
```

**Agent generates**:
- `src/components/ShoppingCart.tsx`
- `src/components/CartItem.tsx`
- `src/components/Checkout.tsx`
- `src/hooks/useCart.ts`
- `src/services/cart.service.ts`
- `src/pages/cart.tsx`
- Tests for all components (Pro tier only)

**Time**: ~3 minutes  
**Lines of code**: ~800  
**Quality score**: 90/100

### Example 2: Add Redis Caching to The Beach

```bash
curl -X POST http://localhost:3000/npe/digital-agents/demo/beach-feature \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-enterprise-67890",
    "featureName": "Redis Caching Layer",
    "description": "Implement Redis caching for PKP lookups and NPE data to reduce database load by 80%"
  }'
```

**Agent generates**:
- `src/cache/redis.service.ts`
- `src/cache/cache.interceptor.ts`
- `src/cache/cache.decorator.ts`
- Updates to PKP and NPE services
- Cache invalidation logic
- Performance benchmarks
- Complete test suite

**Time**: ~2 minutes  
**Lines of code**: ~600  
**Quality score**: 98/100  
**Performance improvement**: 85% faster

---

## Comparing Performance

```bash
curl http://localhost:3000/npe/digital-agents/comparison/performance
```

**Response**:
```json
{
  "tierComparison": [
    {
      "tier": "Free",
      "avgAccuracy": 72,
      "avgBuildTime": 298,
      "avgQuality": 67,
      "totalProjects": 15,
      "totalLinesOfCode": 6750
    },
    {
      "tier": "Pro",
      "avgAccuracy": 91,
      "avgBuildTime": 175,
      "avgQuality": 87,
      "totalProjects": 42,
      "totalLinesOfCode": 33600
    },
    {
      "tier": "Enterprise",
      "avgAccuracy": 97,
      "avgBuildTime": 118,
      "avgQuality": 96,
      "totalProjects": 89,
      "totalLinesOfCode": 134100
    }
  ],
  "recommendation": "Pro tier provides excellent balance of features and cost"
}
```

---

## Integration with Other Systems

### Log Data Marketplace

Digital agents can generate logs while building:

```typescript
// Agent builds project
const build = await buildProject({...});

// Logs generated automatically
// - Build process logs
// - Test execution logs
// - Performance metrics
// - Error reports

// Submit to log marketplace
const analysis = await logMarketplace.analyzeLogEntry({
  source: 'build',
  logContent: build.logs,
  subPKPId: agent.id,
});

// Agent earns money from high-quality logs!
if (analysis.valueScore > 70) {
  await logMarketplace.payForLogData(analysis.id, agent.id);
}
```

### AI Testing & Revenue

Test agent-generated code automatically:

```typescript
// Agent completes build
const build = await buildProject({...});

// Test the generated code
const test = await aiTesting.testCodeImprovement({
  subPKPId: agent.id,
  originalCode: existingCode,
  improvedCode: build.result.code,
  testType: 'revenue-impact',
});

// Deploy if quality is high
if (test.aiAnalysis.recommendation === 'deploy') {
  await aiTesting.deployImprovement(test.id);
}
```

### Game Manager Integration

Agents earn XP for successful builds:

```
Successful build = 100 XP
High quality (>90) = 2x XP multiplier
Tests generated = +50 XP bonus
Zero bugs = +100 XP bonus
```

---

## Troubleshooting

### Agent stuck in "training" status

**Solution**: Training completes in 5-10 seconds. Refresh agent status:
```bash
curl http://localhost:3000/npe/digital-agents/agent-XXX
```

### Build failed with low quality score

**Solution**: 
1. Upgrade to Pro tier for better accuracy
2. Train agent with advanced techniques (RAG, chain-of-thought)
3. Provide more detailed requirements

### "Builds per month limit reached"

**Solution**: Upgrade to Pro tier for unlimited builds

---

## Next Steps

1. ✅ Create your first agent
2. 📝 Train with advanced techniques
3. 🏗️ Build Y8 App features
4. 🚀 Build The Beach NPE features
5. 📊 Monitor dashboard and optimize
6. 💰 Integrate with log marketplace
7. 🎮 Earn XP through game manager

---

**Ready to let AI agents build your projects? Start with the free tier now!** 🤖🚀
