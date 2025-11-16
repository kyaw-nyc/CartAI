# 🔄 OpenRouter Integration Guide

## What is OpenRouter?

OpenRouter is a unified API that gives you access to **100+ AI models** through a single interface:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude Opus, Sonnet, Haiku)
- Google (Gemini Pro, Flash)
- Meta (Llama 3)
- Mistral AI
- And many more, including **FREE models**!

**Benefits:**
- ✅ One API key for all models
- ✅ Automatic fallbacks if a model fails
- ✅ Cost optimization (choose cheaper models for simple tasks)
- ✅ No vendor lock-in
- ✅ Track usage across all models in one dashboard

---

## 🚀 Setup Instructions

### Step 1: Get OpenRouter API Key

1. Go to [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up with GitHub or Google
3. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. Click "Create Key"
5. Copy your API key (starts with `sk-or-v1-...`)

### Step 2: Add API Key to Environment Variables

Create or update your `.env.local` file:

```bash
# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Optional: Your site URL (for OpenRouter rankings)
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

### Step 3: Choose Your Integration Strategy

We've created **3 example strategies** for using OpenRouter:

#### **Strategy 1: Different Models for Different Sellers** (Cost Optimization)

Premium sellers use expensive models, budget sellers use cheap/free models:

```typescript
// In lib/agents/sellers.ts
import { generateSellerResponseStrategy1 } from './sellers-openrouter'

// Replace the current generateSellerResponse with:
export async function generateSellerResponse(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  currentOffer: Offer
): Promise<string> {
  return generateSellerResponseStrategy1(
    profile,
    product,
    quantity,
    buyerMessage,
    currentOffer
  )
}
```

**Cost per negotiation:**
- EcoSupply (Premium): GPT-4o → ~$0.03
- QuickShip (Mid): Claude Haiku → ~$0.001
- ValueGreen (Budget): Mythomax → **FREE**
- **Total: ~$0.031 per negotiation** (vs $0.15 with all GPT-4o)

---

#### **Strategy 2: Fallback for Reliability**

Try GPT-4o first, automatically fall back to Claude if it fails:

```typescript
import { generateSellerResponseWithFallback } from './sellers-openrouter'

export async function generateSellerResponse(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  currentOffer: Offer
): Promise<string> {
  return generateSellerResponseWithFallback(
    profile,
    product,
    quantity,
    buyerMessage,
    currentOffer
  )
}
```

**Benefits:**
- If GPT-4o is down → automatically uses Claude
- 99.9% uptime
- No user-facing errors

---

#### **Strategy 3: Round-Based Optimization**

Use cheap models for early rounds, expensive models for critical later rounds:

```typescript
import { generateSellerResponseCostOptimized } from './sellers-openrouter'

// In orchestrator, pass roundNumber:
const response = await generateSellerResponseCostOptimized(
  profile,
  product,
  quantity,
  buyerResponse,
  improvedOffer,
  roundNumber // Pass current round
)
```

**Cost breakdown:**
- Rounds 1-2: GPT-4o Mini (cheap) → $0.01
- Rounds 3-6: GPT-4o (quality) → $0.12
- **Total: ~$0.13 per negotiation** (vs $0.25 with all GPT-4o)

---

## 📊 Available Models and Pricing

### OpenAI Models (via OpenRouter)
```typescript
OPENROUTER_MODELS.GPT4O          // $0.005 per 1K tokens
OPENROUTER_MODELS.GPT4O_MINI     // $0.0002 per 1K tokens (cheapest!)
OPENROUTER_MODELS.GPT4_TURBO     // $0.01 per 1K tokens
OPENROUTER_MODELS.GPT35_TURBO    // $0.0005 per 1K tokens
```

### Anthropic Claude Models
```typescript
OPENROUTER_MODELS.CLAUDE_OPUS    // $0.015 per 1K tokens (most capable)
OPENROUTER_MODELS.CLAUDE_SONNET  // $0.003 per 1K tokens
OPENROUTER_MODELS.CLAUDE_HAIKU   // $0.0003 per 1K tokens (fast + cheap)
```

### Google Gemini Models
```typescript
OPENROUTER_MODELS.GEMINI_PRO     // $0.0005 per 1K tokens
OPENROUTER_MODELS.GEMINI_FLASH   // $0.0001 per 1K tokens
```

### FREE Models 🎉
```typescript
OPENROUTER_MODELS.MYTHOMAX       // FREE! Great for testing
OPENROUTER_MODELS.NOUS_HERMES    // Nearly free
```

Full pricing: [https://openrouter.ai/docs/models](https://openrouter.ai/docs/models)

---

## 🧪 Testing OpenRouter

### Quick Test

Create a test file:

```typescript
// test-openrouter.ts
import { callOpenRouter, OPENROUTER_MODELS } from './lib/api/openrouter'

async function test() {
  const response = await callOpenRouter('Say hello!', {
    model: OPENROUTER_MODELS.GPT4O_MINI,
  })
  console.log(response)
}

test()
```

Run:
```bash
npx tsx test-openrouter.ts
```

### Test Free Models

```typescript
import { callOpenRouterFree } from './lib/api/openrouter'

const response = await callOpenRouterFree('Tell me a joke about AI')
console.log(response.content)
```

---

## 🎯 Recommended Setup for Your Project

For **hackathons** and **cost optimization**, I recommend:

### Option A: Mixed Strategy (Best Value)
```typescript
// lib/agents/sellers.ts
import {
  callOpenRouter,
  OPENROUTER_MODELS
} from '../api/openrouter'

export async function generateSellerResponse(...) {
  // Premium sellers = Claude Opus (best quality)
  if (profile.personality.pricePoint === 'premium') {
    const response = await callOpenRouter(prompt, {
      model: OPENROUTER_MODELS.CLAUDE_OPUS,
      temperature: 0.8,
    })
    return response.content || fallback
  }

  // Budget sellers = Free model
  const response = await callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.MYTHOMAX,
    temperature: 0.8,
  })
  return response.content || fallback
}
```

### Option B: All GPT-4o Mini (Ultra Cheap)
```typescript
// Replace all callGPT4o with:
import { callOpenRouter, OPENROUTER_MODELS } from '../api/openrouter'

const response = await callOpenRouter(prompt, {
  model: OPENROUTER_MODELS.GPT4O_MINI, // 25x cheaper than GPT-4o!
  temperature: 0.8,
})
```

**Savings:** ~$0.01 per negotiation vs $0.25 with direct OpenAI

---

## 📈 Monitoring Usage

1. Go to [https://openrouter.ai/activity](https://openrouter.ai/activity)
2. See all API calls, costs, and model usage
3. Set spending limits
4. Get alerts when approaching limits

---

## 🔧 Advanced: Custom Model Selection

Let users choose AI model via UI:

```typescript
// types/product.ts
export interface ProductRequirements {
  product: string | null
  quantity: number | null
  budget: number | null
  priority: Priority | null
  aiModel?: 'gpt4o' | 'claude' | 'gemini' | 'free' // Add this
}

// In negotiation flow:
const modelMap = {
  gpt4o: OPENROUTER_MODELS.GPT4O,
  claude: OPENROUTER_MODELS.CLAUDE_HAIKU,
  gemini: OPENROUTER_MODELS.GEMINI_FLASH,
  free: OPENROUTER_MODELS.MYTHOMAX,
}

const response = await callOpenRouter(prompt, {
  model: modelMap[userSelectedModel],
})
```

---

## 🆚 OpenRouter vs Direct OpenAI

| Feature | OpenRouter | Direct OpenAI |
|---------|-----------|---------------|
| Models Available | 100+ | 5 |
| Pricing | Competitive | Standard |
| Fallback Support | ✅ Built-in | ❌ Manual |
| Free Models | ✅ Yes | ❌ No |
| Setup Complexity | Same | Same |
| Vendor Lock-in | ❌ None | ✅ Yes |

---

## 🐛 Troubleshooting

### "Invalid API Key"
- Make sure your key starts with `sk-or-v1-`
- Check `.env.local` (not `.env`)
- Restart dev server: `npm run dev`

### "Model not found"
- Check model name: [https://openrouter.ai/docs/models](https://openrouter.ai/docs/models)
- Some models require credits

### "Rate limited"
- Free tier has limits
- Add credits: [https://openrouter.ai/credits](https://openrouter.ai/credits)

---

## 📚 Resources

- **Docs:** [https://openrouter.ai/docs/quickstart](https://openrouter.ai/docs/quickstart)
- **Models:** [https://openrouter.ai/docs/models](https://openrouter.ai/docs/models)
- **Pricing:** [https://openrouter.ai/docs/models](https://openrouter.ai/docs/models)
- **Dashboard:** [https://openrouter.ai/activity](https://openrouter.ai/activity)
- **Discord:** [https://discord.gg/fVyRaUDgxW](https://discord.gg/fVyRaUDgxW)

---

## ✅ Quick Migration Checklist

- [ ] Get OpenRouter API key
- [ ] Add `OPENROUTER_API_KEY` to `.env.local`
- [ ] Choose strategy (mixed, fallback, or cost-optimized)
- [ ] Update `lib/agents/sellers.ts` with OpenRouter imports
- [ ] Test with free model first
- [ ] Monitor usage in dashboard
- [ ] Optimize based on costs

---

**Need help?** Check the example files:
- `lib/api/openrouter.ts` - Client setup
- `lib/agents/sellers-openrouter.ts` - Example strategies
