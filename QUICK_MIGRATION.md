# 🚀 Quick OpenRouter Migration (5 minutes)

## Step 1: Get API Key (2 minutes)

1. Visit [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up with GitHub/Google
3. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. Click "Create Key" → Copy it

## Step 2: Add to Environment (30 seconds)

Add to `.env.local`:
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Restart dev server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Step 3: Update ONE File (2 minutes)

Open `lib/agents/sellers.ts` and make this simple change:

### BEFORE (Current - Using Direct OpenAI):
```typescript
import { callGPT4o } from '../api/openai'

export async function generateSellerResponse(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  currentOffer: Offer
): Promise<string> {
  const prompt = `You are ${profile.name}...`

  // All sellers use GPT-4o for reliability
  const response = await callGPT4o(prompt, undefined, 0.8)

  if (!response.success || !response.content) {
    return getFallbackResponse(...)
  }

  return response.content
}
```

### AFTER (OpenRouter - Same GPT-4o):
```typescript
import { callOpenRouter, OPENROUTER_MODELS } from '../api/openrouter'

export async function generateSellerResponse(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  currentOffer: Offer
): Promise<string> {
  const prompt = `You are ${profile.name}...`

  // Now using OpenRouter (still GPT-4o, but with more options!)
  const response = await callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.GPT4O,
    temperature: 0.8,
  })

  if (!response.success || !response.content) {
    return getFallbackResponse(...)
  }

  return response.content
}
```

**That's it!** Everything else stays the same.

---

## Step 4: Test (30 seconds)

1. Start a new negotiation
2. Check console for any errors
3. Verify negotiations work the same

✅ **Done!** You're now using OpenRouter.

---

## 💰 Optional: Save Money (Cost Optimization)

Once basic migration works, you can optimize costs:

### Option A: Use Cheaper GPT-4o Mini

```typescript
const response = await callOpenRouter(prompt, {
  model: OPENROUTER_MODELS.GPT4O_MINI, // 25x cheaper!
  temperature: 0.8,
})
```

**Savings:** ~$0.20 per negotiation → ~$0.01 per negotiation

### Option B: Different Models for Different Sellers

```typescript
// Premium seller = Best quality (Claude Opus)
if (profile.personality.pricePoint === 'premium') {
  const response = await callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.CLAUDE_OPUS,
    temperature: 0.8,
  })
  return response.content || fallback
}

// Mid-tier seller = Fast & cheap (Claude Haiku)
if (profile.personality.pricePoint === 'mid') {
  const response = await callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.CLAUDE_HAIKU,
    temperature: 0.8,
  })
  return response.content || fallback
}

// Budget seller = FREE model
const response = await callOpenRouter(prompt, {
  model: OPENROUTER_MODELS.MYTHOMAX,
  temperature: 0.8,
})
return response.content || fallback
```

**Savings:** ~$0.25 per negotiation → ~$0.03 per negotiation

---

## 🎯 Recommended for Hackathon

**Best balance of cost & quality:**

```typescript
// Use GPT-4o Mini for all agents
const response = await callOpenRouter(prompt, {
  model: OPENROUTER_MODELS.GPT4O_MINI,
  temperature: 0.8,
})
```

**Why?**
- ✅ 25x cheaper than GPT-4o
- ✅ Still very capable (95% as good as GPT-4o)
- ✅ Perfect for demos and testing
- ✅ Can handle 1000s of negotiations for $5

---

## 📊 Track Your Usage

Check your costs at: [https://openrouter.ai/activity](https://openrouter.ai/activity)

Set spending limits to avoid surprises!

---

## 🔧 If Something Breaks

**Rollback in 10 seconds:**

Just change back to:
```typescript
import { callGPT4o } from '../api/openai'
const response = await callGPT4o(prompt, undefined, 0.8)
```

Both APIs work identically, so rolling back is instant!
