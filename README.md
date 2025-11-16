# CartAI - AI-Powered Shopping Negotiation Platform

A real-time negotiation platform where AI agents negotiate on your behalf with multiple stores to find the best deals based on your priorities.

## How It Works

CartAI uses multiple AI models to simulate realistic negotiations between buyers and sellers. The system creates a balanced marketplace where neither party always wins.

### Conversation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    INITIAL CONVERSATION                          │
│                    Uses: Your OpenAI API                         │
│                    Model: GPT-4o                                 │
└──────────────────────────────────────────────────────────────────┘
                                ↓
                      User Selects Priority
                                ↓
                     ┌─────────────────┐
                     │  MAP SELECTION  │
                     │  Click a Store  │
                     └─────────────────┘
                                ↓
          ┌────────────────────────────────────────────┐
          │        SINGLE STORE NEGOTIATION            │
          └────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Store Selected          Buyer Agent         Seller Agent       │
├─────────────────────────────────────────────────────────────────┤
│  H&M                     GPT-4o-mini         GPT-4o             │
│  (OpenRouter)            (Your API)          (Your API)         │
├─────────────────────────────────────────────────────────────────┤
│  Zara                    Claude 3 Haiku      Claude 3.5 Sonnet  │
│  (Anthropic)             (OpenRouter)        (OpenRouter)       │
├─────────────────────────────────────────────────────────────────┤
│  Hugo Boss               DeepSeek Chat       DeepSeek Chat      │
│  (Gemini/DeepSeek)       (OpenRouter)        (OpenRouter)       │
└─────────────────────────────────────────────────────────────────┘
```

## Balanced Negotiation System

### How Winners Are Determined

The system uses realistic negotiation dynamics where either party can win based on several factors:

**Seller Behavior (30/30/40 split):**
- 30% chance: Seller holds firm (minimal concessions)
- 30% chance: Seller gives moderate discounts
- 40% chance: Seller negotiates normally

**Flexibility Levels:**
- Low flexibility: 2% price reduction per round
- Medium flexibility: 4% price reduction per round
- High flexibility: 6% price reduction per round

**Random Elements:**
- 15% chance seller increases price in early rounds (testing buyer commitment)
- 30% chance seller refuses rush delivery requests
- Price variations of ±3% for realism

### Outcome Categories

**Buyer Wins (15%+ under budget)**
- Seller made significant concessions
- Buyer's negotiation was effective

**Fair Deal (5-15% under budget)**
- Both parties compromised
- Balanced negotiation

**Market Rate (within 5% of budget)**
- Seller held ground
- Standard market pricing

**Seller Wins (5%+ over budget)**
- Seller defended premium pricing
- Buyer pays more for quality/speed/sustainability

## Priority System

Users adjust three sliders that always total 100%:

- **Speed**: How quickly you need delivery
- **Carbon**: Environmental impact priority
- **Price**: Best deal focus

The system uses the dominant priority to guide the buyer agent's negotiation strategy.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Database**: Supabase (Auth + Storage)
- **AI Models**:
  - OpenAI GPT-4o (Your API)
  - Anthropic Claude 3.5 Sonnet (OpenRouter)
  - DeepSeek Chat (OpenRouter)
- **Maps**: Google Maps JavaScript API
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

## Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd productscout
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Add your API keys:
```
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

4. Set up Supabase tables

Run the SQL commands in `supabase/schema.sql` to create:
- `profiles` table
- `negotiations` table
- Row Level Security policies

5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **Real-time AI Negotiations**: Watch agents negotiate in real-time
- **Multiple Priorities**: Balance speed, carbon footprint, and price
- **Interactive Map**: Select stores in Manhattan to negotiate with
- **Conversation History**: Save and reload past negotiations
- **Win/Loss Analysis**: See who won each negotiation and why
- **Model Transparency**: Know which AI model is handling each conversation

## Performance Optimizations

- 4 negotiation rounds (optimized from 6)
- Reduced API response times (0.5-0.6 temperature)
- Token limits for faster generation (80-100 tokens)
- Minimal delays between messages (100-200ms)

## Project Structure

```
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── landing/           # Landing page components
│   ├── map/               # Map view components
│   └── negotiation/       # Negotiation UI components
├── lib/
│   ├── agents/            # AI agent logic
│   ├── api/               # API clients
│   ├── store/             # Zustand state management
│   ├── supabase/          # Database client
│   └── utils/             # Helper functions
└── types/                 # TypeScript types
```

## License

MIT
