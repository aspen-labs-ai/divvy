# CLAUDE.md - Divvy Project Guide

## What Is This?
**Divvy** — A dead-simple group expense splitting app. No login, no backend. localStorage-based prototype. Share a link, split bills, see who owes who.

## Tech Stack
- **Framework:** Next.js 15+ (App Router, `src/` directory)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Data:** localStorage (no database, no backend)
- **Package Manager:** pnpm
- **Deployment:** Vercel

## Design System
- **Theme:** Dark mode ONLY (no light mode toggle)
- **Primary background:** `#0a0a0a` (near-black)
- **Card background:** `#1a1a1a` with subtle border `#2a2a2a`
- **Accent color:** `#22c55e` (green-500) — used for CTAs, active states, positive amounts
- **Negative amounts:** `#ef4444` (red-500)
- **Text:** White (`#fafafa`) primary, `#a1a1aa` secondary
- **Font:** System font stack (Inter if available)
- **Border radius:** Generous (rounded-xl for cards, rounded-full for avatars)
- **Mobile-first:** Everything must look great on 375px width
- **Vibe:** Premium fintech app. Dark background, neon green accents, card-based layout, avatar circles for group members.

## Architecture

### Data Model (localStorage)
All trip data stored in localStorage under key `divvy_trip_{code}`:

```typescript
interface Trip {
  id: string;
  code: string;        // 6-char shareable code
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  avatarColor: string; // hex color for avatar circle
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidById: string;      // member id
  splitBetween: string[]; // member ids
  createdAt: string;
}

interface Settlement {
  fromId: string;
  toId: string;
  amount: number;
}
```

### Routes
```
/                     → Landing page (create a new trip)
/trip/[code]          → Main trip view (expenses list + balances)
/trip/[code]/add      → Add expense form
/trip/[code]/settle   → Settlement view (who owes who)
```

### Trip Index
Also store a trip index in localStorage key `divvy_trips` — array of `{code, name, createdAt}` so the landing page can show "Your recent trips".

### Settlement Algorithm
Greedy algorithm:
1. Calculate net balance for each person (total paid - total share owed)
2. Sort into debtors (negative) and creditors (positive)
3. Match largest debtor with largest creditor
4. Transfer min(|debt|, credit) between them
5. Repeat until settled
6. Use integer cents internally to avoid floating-point drift

### Avatar Color Palette
Auto-assign from: `["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7"]`

## Commands
```bash
pnpm dev          # Development server
pnpm build        # Production build  
pnpm lint         # ESLint
```

## Rules
- Mobile-first responsive design (max-w-md mx-auto for main content)
- All monetary amounts displayed as USD with 2 decimal places
- No authentication, no backend — pure client-side localStorage
- Anyone with the trip code can view/edit (on the same device for now)
- Short trip codes (6 chars, alphanumeric, uppercase)
- Expense amounts must be positive numbers
- At least one member must be selected for each expense split
- "use client" directive on all pages that use state/effects
- All styling via Tailwind classes
