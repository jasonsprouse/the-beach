# Log Data Marketplace Quickstart

**Get paid for your pipeline logs in 5 minutes!**

---

## What You'll Build

A system where AI agents monitor your software pipeline (build, test, deploy, runtime) and **pay you for valuable log data** that improves development.

**Revenue Model**: $0.10 to $20+ per log based on quality and insights!

---

## Prerequisites

- NestJS backend running
- Sub-PKP ID from NPE Manager Auth system
- AI services configured (OpenAI GPT-4, Anthropic Claude)

---

## 5-Minute Setup

### Step 1: Run a Simulation (30 seconds)

Test the marketplace with sample pipeline logs:

```bash
curl -X POST http://localhost:3000/npe/log-marketplace/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "subPKPId": "your-sub-pkp-id",
    "iterations": 5
  }'
```

**Expected Output**:
```json
{
  "simulationComplete": true,
  "iterations": 5,
  "summary": {
    "totalPaid": 18.95,
    "averageValue": 78,
    "averagePayment": 3.79,
    "totalInsights": 12
  }
}
```

**Result**: You just earned **$18.95** from 5 sample logs! 💰

---

### Step 2: Submit Your First Real Log (1 minute)

Send a log from your pipeline:

```bash
curl -X POST http://localhost:3000/npe/log-marketplace/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "source": "runtime",
    "logContent": "[2025-11-06 10:45:00] ERROR: Database query timeout after 5000ms\n[2025-11-06 10:45:00] Query: SELECT * FROM users WHERE email LIKE '\''%@gmail.com'\''",
    "subPKPId": "your-sub-pkp-id"
  }'
```

**Response**:
```json
{
  "id": "analysis-abc123",
  "paymentAmount": 2.45,
  "quality": {
    "overall": 85
  },
  "valueScore": 75,
  "aiInsights": {
    "performanceIssues": [
      {
        "issue": "Slow database query (5000ms timeout)",
        "optimization": "Add index on email column",
        "estimatedImprovement": "90% faster"
      }
    ]
  },
  "improvementPotential": {
    "estimatedROI": 5800
  }
}
```

**Result**: Your log is worth **$2.45**! The AI detected a performance issue.

---

### Step 3: Get Paid (30 seconds)

Execute the payment transaction:

```bash
curl -X POST http://localhost:3000/npe/log-marketplace/pay/analysis-abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "subPKPId": "your-sub-pkp-id"
  }'
```

**Response**:
```json
{
  "id": "txn-xyz789",
  "amount": 2.45,
  "timestamp": "2025-11-06T10:46:00Z"
}
```

**Result**: **Payment executed!** $2.45 credited to your Sub-PKP. 💸

---

### Step 4: Check Your Dashboard (30 seconds)

View your earnings and stats:

```bash
curl http://localhost:3000/npe/log-marketplace/dashboard
```

**Response**:
```json
{
  "totalPaid": 21.40,
  "totalInsights": 18,
  "averagePayment": 3.56,
  "topDataSellers": [
    {
      "subPKPId": "your-sub-pkp-id",
      "earnings": 21.40,
      "logs": 6
    }
  ]
}
```

**Result**: You've earned **$21.40** total! 🎉

---

### Step 5: View Your Rank (30 seconds)

See where you stand:

```bash
curl http://localhost:3000/npe/log-marketplace/top-earners?limit=10
```

**Response**:
```json
{
  "topEarners": [
    {
      "rank": 1,
      "subPKPId": "your-sub-pkp-id",
      "totalEarnings": 21.40,
      "logsSubmitted": 6,
      "averageEarnings": 3.57
    }
  ]
}
```

**Result**: You're **#1** in earnings! 🏆

---

## Next Steps

### Automate Log Submission

#### From GitHub Actions

```yaml
# .github/workflows/log-marketplace.yml
name: Submit Pipeline Logs

on:
  push:
    branches: [main]
  pull_request:

jobs:
  submit-logs:
    runs-on: ubuntu-latest
    steps:
      - name: Capture build logs
        run: |
          npm run build 2>&1 | tee build.log
      
      - name: Submit to marketplace
        run: |
          curl -X POST http://your-api.com/npe/log-marketplace/analyze \
            -H "Content-Type: application/json" \
            -d "{
              \"source\": \"build\",
              \"logContent\": \"$(cat build.log | jq -Rs .)\",
              \"subPKPId\": \"${{ secrets.SUB_PKP_ID }}\"
            }"
```

#### From Docker/Kubernetes

```yaml
# kubernetes-log-shipper.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: log-marketplace-config
data:
  submit-logs.sh: |
    #!/bin/bash
    LOGS=$(kubectl logs -l app=your-app --tail=100)
    curl -X POST http://your-api.com/npe/log-marketplace/analyze \
      -H "Content-Type: application/json" \
      -d "{
        \"source\": \"runtime\",
        \"logContent\": \"$LOGS\",
        \"subPKPId\": \"$SUB_PKP_ID\"
      }"
```

#### From Node.js App

```typescript
// logger.middleware.ts
import axios from 'axios';

export async function submitErrorLog(error: Error, context: any) {
  const logContent = `
[${new Date().toISOString()}] ERROR: ${error.message}
Stack: ${error.stack}
Context: ${JSON.stringify(context, null, 2)}
  `;

  try {
    const analysis = await axios.post('http://localhost:3000/npe/log-marketplace/analyze', {
      source: 'runtime',
      logContent,
      subPKPId: process.env.SUB_PKP_ID,
    });

    // Auto-pay for high-value logs
    if (analysis.data.valueScore > 70) {
      await axios.post(`http://localhost:3000/npe/log-marketplace/pay/${analysis.data.id}`, {
        subPKPId: process.env.SUB_PKP_ID,
      });
      console.log(`Log data payment: $${analysis.data.paymentAmount}`);
    }
  } catch (err) {
    console.error('Failed to submit log:', err);
  }
}
```

---

## Maximizing Earnings

### High-Value Log Types

#### 1. Critical Errors ($5-$15)
```
[2025-11-06 10:45:00] CRITICAL: Application crashed
[2025-11-06 10:45:00] TypeError: Cannot read property 'id' of undefined
[2025-11-06 10:45:00] at processOrder (orders.service.ts:42:18)
[2025-11-06 10:45:00] Impact: 12 failed transactions, $2,400 revenue loss
```
**Payment**: ~$11.55

#### 2. Security Vulnerabilities ($10-$20)
```
[2025-11-06 10:40:05] SECURITY ALERT: SQL injection attempt detected
[2025-11-06 10:40:05] IP: 192.168.1.100
[2025-11-06 10:40:05] Query: SELECT * FROM users WHERE id = '1 OR 1=1'
[2025-11-06 10:40:05] Access denied and IP blocked
```
**Payment**: ~$15.75

#### 3. Performance Issues ($2-$5)
```
[2025-11-06 10:40:02] WARNING: Slow database query
[2025-11-06 10:40:02] Query took 1842ms (threshold: 1000ms)
[2025-11-06 10:40:02] SELECT * FROM orders WHERE user_id IN (...)
[2025-11-06 10:40:02] N+1 query detected (250 queries in loop)
```
**Payment**: ~$3.25

#### 4. Build Failures ($1-$3)
```
[2025-11-06 10:31:12] BUILD FAILED
[2025-11-06 10:31:12] ERROR: Type 'string' is not assignable to type 'number'
[2025-11-06 10:31:12] File: src/services/payment.service.ts:42:8
[2025-11-06 10:31:12] Expected: number, Received: string
```
**Payment**: ~$1.85

---

## Quality Checklist

To maximize payment, include:

✅ **Timestamps** - When did it happen?  
✅ **Error messages** - What went wrong?  
✅ **Stack traces** - Where in the code?  
✅ **Performance metrics** - How slow/fast?  
✅ **Security events** - Any threats detected?  
✅ **Impact** - Users affected? Revenue lost?  
✅ **Context** - What was the system doing?  
✅ **Suggestions** - How to fix it?

---

## Understanding Payment

### Payment Formula
```
Payment = (Base + Quality + Bonuses) * ValueScore%
```

### Example Breakdown

**Log**: Critical error causing revenue loss

```
Base Price:       $0.10
Quality (92/100): $0.92  (92 * $0.01)
Bonuses:
  - Critical:     $5.00
  - Uniqueness:   $0.50
Subtotal:         $6.52
Value Score:      100%
TOTAL:            $6.52
```

---

## Common Questions

### Q: What logs should I submit?

**A**: Focus on actionable errors, performance issues, and security events. High-quality logs that help improve development get paid more.

### Q: How often can I submit logs?

**A**: Up to 1000 logs per hour per Sub-PKP. Use batch analyze for multiple logs.

### Q: When do I get paid?

**A**: Instantly! Call the `/pay` endpoint after analysis to execute payment.

### Q: What if my logs have low quality scores?

**A**: Include more details:
- Complete stack traces
- Performance metrics
- Error context
- Fix suggestions

### Q: Can I see what AI agents found?

**A**: Yes! Check the `aiInsights` in the analysis response for detailed findings.

---

## Monitoring Your Pipeline

### Real-Time Monitoring Setup

```typescript
// pipeline-monitor.ts
import axios from 'axios';
import fs from 'fs';
import { spawn } from 'child_process';

class PipelineMonitor {
  private subPKPId: string;
  
  constructor(subPKPId: string) {
    this.subPKPId = subPKPId;
  }
  
  async monitorBuild() {
    const build = spawn('npm', ['run', 'build']);
    let buildLog = '';
    
    build.stdout.on('data', (data) => {
      buildLog += data.toString();
    });
    
    build.stderr.on('data', (data) => {
      buildLog += data.toString();
    });
    
    build.on('close', async (code) => {
      await this.submitLog('build', buildLog);
    });
  }
  
  async monitorTests() {
    const test = spawn('npm', ['test']);
    let testLog = '';
    
    test.stdout.on('data', (data) => {
      testLog += data.toString();
    });
    
    test.on('close', async (code) => {
      await this.submitLog('test', testLog);
    });
  }
  
  async submitLog(source: string, content: string) {
    try {
      const analysis = await axios.post(
        'http://localhost:3000/npe/log-marketplace/analyze',
        {
          source,
          logContent: content,
          subPKPId: this.subPKPId,
        }
      );
      
      console.log(`📊 Log analyzed: ${analysis.data.id}`);
      console.log(`💰 Value: $${analysis.data.paymentAmount}`);
      console.log(`⭐ Quality: ${analysis.data.quality.overall}/100`);
      
      if (analysis.data.valueScore > 60) {
        const payment = await axios.post(
          `http://localhost:3000/npe/log-marketplace/pay/${analysis.data.id}`,
          { subPKPId: this.subPKPId }
        );
        console.log(`✅ Paid: $${payment.data.amount}`);
      }
    } catch (error) {
      console.error('❌ Error submitting log:', error.message);
    }
  }
}

// Usage
const monitor = new PipelineMonitor(process.env.SUB_PKP_ID!);
monitor.monitorBuild();
monitor.monitorTests();
```

---

## Integration with Game Manager

### Earning XP from Logs

Every paid log earns game points:

```
Points = PaymentAmount * 10

Example:
$2.45 payment = 24 XP
$11.55 payment = 115 XP
```

### Quality Multipliers

| Quality Score | XP Multiplier |
|---------------|---------------|
| 90-100 | 2x |
| 80-89 | 1.5x |
| 70-79 | 1.25x |
| 60-69 | 1x |

**Example**:
```
Payment: $5.00
Base XP: 50
Quality: 92
Multiplier: 2x
Total XP: 100
```

### Achievements

Unlock badges for log contributions:

🏅 **Data Detective** - 10 critical errors found  
🛡️ **Security Sentinel** - 5 security issues detected  
⚡ **Performance Pro** - 20 performance optimizations  
💎 **Log Master** - $1000 earned from logs  

---

## Test Your Setup

### Quick Test Script

```bash
#!/bin/bash

# Test script for log marketplace
SUB_PKP_ID="your-sub-pkp-id"
API_URL="http://localhost:3000/npe/log-marketplace"

echo "🚀 Testing Log Data Marketplace..."

# 1. Run simulation
echo "1️⃣  Running simulation..."
curl -s -X POST $API_URL/simulate \
  -H "Content-Type: application/json" \
  -d "{\"subPKPId\":\"$SUB_PKP_ID\",\"iterations\":3}" \
  | jq '.summary'

# 2. Check dashboard
echo "2️⃣  Checking dashboard..."
curl -s $API_URL/dashboard | jq '{totalPaid, totalInsights}'

# 3. View top earners
echo "3️⃣  Top earners..."
curl -s "$API_URL/top-earners?limit=5" | jq '.topEarners[0]'

# 4. Check agents
echo "4️⃣  Monitoring agents..."
curl -s $API_URL/agents | jq '{totalAgents, activeAgents}'

echo "✅ Test complete!"
```

Run it:
```bash
chmod +x test-marketplace.sh
./test-marketplace.sh
```

---

## Troubleshooting

### Issue: Low payment amounts

**Solution**: Add more details to logs:
- Include stack traces
- Add performance metrics
- Provide error context

### Issue: Quality score below 60

**Solution**: 
- Use complete error messages
- Include timestamps
- Add line numbers and file paths

### Issue: No AI insights detected

**Solution**:
- Make sure logs contain actual errors/issues
- Include performance data
- Add security events

---

## Next Steps

1. ✅ **Completed**: Basic marketplace setup
2. 📝 **Next**: Read `LOG_DATA_MARKETPLACE_GUIDE.md` for deep dive
3. 🔄 **Then**: Integrate with your CI/CD pipeline
4. 📊 **Finally**: Monitor dashboard and optimize for revenue

---

## Support

- **Full Guide**: `LOG_DATA_MARKETPLACE_GUIDE.md`
- **API Reference**: See guide for all 10 endpoints
- **Code Review**: `AI_TESTING_REVENUE_GUIDE.md` for complementary system

**Happy log mining! 💰📊**
