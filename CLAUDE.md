# CLAUDE.md - Divvy Project Guide

## What Is This?
**Divvy** — A dead-simple group expense splitting app. No login, share a link, split bills, see who owes who. Real-time sync.

## Tech Stack
- **Framework:** Next.js 15+ (App Router, `src/` directory)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Database/Realtime:** Supabase (Postgres + Realtime subscriptions)
- **Package Manager:** pnpm
- **Deployment:** Vercel

## Design System
- **Theme:** Dark mode ONLY (no light mode toggle)
- **Primary background:** `#0a0a0a` (near-black)
- **Card background:** `#1a1a1a` with subtle border `#2a2a2a`
- **Accent color:** `#22c55e` (green-500) — used for CTAs, active states, amounts
- **Text:** White (`#fafafa`) primary, `#a1a1aa` secondary
- **Font:** System font stack (Inter if available)
- **Border radius:** Generous (rounded-xl for cards, rounded-full for avatars)
- **Mobile-first:** Everything must look great on 375px width

## Architecture

### Routes
```
/                     → Landing page (create a new trip)
/trip/[code]          → Main trip view (expenses list + balances)
/trip/[code]/add      → Add expense form
/trip/[code]/settle   → Settlement view (who owes who)
```

### Database Schema (Supabase)
```sql
-- Trips
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,  -- short shareable code
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members (no auth, just names)
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  avatar_color VARCHAR(7) DEFAULT '#22c55e',  -- hex color for avatar circle
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  paid_by UUID REFERENCES members(id) ON DELETE CASCADE,
  description VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense splits (who was part of this expense)
CREATE TABLE expense_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE(expense_id, member_id)
);
```

### Key Features
1. **Create Trip** — Name it, get a shareable link with short code
2. **Add Members** — Just names + auto-assigned avatar colors
3. **Add Expense** — Who paid, amount, description, select who was involved
4. **Real-time Balances** — Live-updating balance per member (positive = owed, negative = owes)
5. **Settlement** — Optimized "who pays who" to minimize transactions
6. **Share Link** — Copy trip link to invite others

### Settlement Algorithm
Use the greedy algorithm:
1. Calculate net balance for each person (total paid - total owed)
2. Sort into debtors (negative) and creditors (positive)  
3. Match largest debtor with largest creditor
4. Transfer min(|debt|, credit) between them
5. Repeat until settled

## Commands
```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check (add to package.json: "typecheck": "tsc --noEmit")
```

## Rules
- Mobile-first responsive design
- All monetary amounts displayed as USD with 2 decimal places
- Use Supabase Realtime for live updates (subscribe to changes)
- No authentication — anyone with the trip link can view/edit
- Avatar colors auto-assigned from a preset palette
- Short trip codes (6-8 chars, alphanumeric, URL-safe)
- Expense amounts must be positive numbers
- At least one member must be selected for each expense split
