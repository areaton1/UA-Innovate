# UA Innovate Hackathon — PNC Smart Banking App

## Project Overview
A mock PNC mobile banking app with AI-powered personal finance features built for a hackathon. The app mimics the PNC Mobile Banking UI and adds smart financial wellness tools on top of mock account/transaction data.

## Tech Stack
- **Mobile:** Expo SDK 54, React Native 0.81.5, TypeScript
- **Navigation:** Expo Router v6 (file-based routing)
- **Backend:** TBD — may be added later. Currently all data is mocked.

## Running the App
```bash
cd mobile
npx expo start           # standard
npx expo start --tunnel  # if on different network than phone
npx expo start --ios     # iOS Simulator (requires Xcode)
```
**Login credentials:** `ep@email.com` / `password123`

## File Structure
```
mobile/
├── app/
│   ├── _layout.tsx           # Root layout, wraps AuthProvider
│   ├── index.tsx             # Redirects to login or home
│   ├── (auth)/
│   │   └── login.tsx         # Login screen
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab bar config
│   │   ├── home.tsx          # Dashboard
│   │   └── transactions.tsx  # Transaction history
│   ├── context/
│   │   └── AuthContext.tsx   # Auth state
│   └── data/
│       └── mockData.ts       # All mock users, accounts, transactions
```

## Brand Colors (always use these)
- **PNC Orange:** `#EF7622`
- **PNC Navy:** `#003087`
- **Light Blue:** `#E6F4FE`
- **Background:** `#F4F6F9`

## Features to Build
These are the planned AI/smart features to add to the app:

### 1. Behavior Simulator
- Shows the financial path the user will follow if they continue current spending habits
- Consider using a Monte Carlo distribution to model outcome uncertainty
- Visualize best/worst/expected case over time (chart)

### 2. Financial Confidence Score
- A single score (0–100 or letter grade) summarizing the user's financial health
- Based on: spending vs income ratio, savings rate, subscription load, goal progress
- Display prominently on the home dashboard

### 3. Safe-to-Spend Widget
- Dynamic daily/weekly budget the user can safely spend right now
- Factors in: upcoming bills, savings goals, current balance, past spending patterns
- Show on home screen as a prominent card

### 4. Subscription Radar
- Detects recurring charges from transaction history
- Flags "subscription creep" — subscriptions the user may have forgotten
- Shows total monthly subscription cost

### 5. Savings Momentum Tracker
- Tracks progress toward savings goals
- Motivational UI — shows streaks, momentum, projected goal completion date
- Nudges user when momentum is slowing

### 6. Confidence Challenges
- Gamified savings/spending challenges (e.g. "No eating out this week")
- Tier/ranking system (e.g. Bronze → Silver → Gold → Platinum)
- Progress tracking and completion rewards (badges)

### 7. Personalized Action Recommendations
- Push notifications that nudge the user toward better habits
- Personalized based on their spending patterns and goals
- Examples: "You've spent 80% of your dining budget" / "Great week! You saved $50 more than usual"

## Rules / Preferences
- **Never auto-commit** — always ask before running `git commit`
- **Always use TypeScript** — no `.js` files
- **Keep all mock/fake data in `app/_data/`** (underscore prefix so Expo Router doesn’t treat it as a route)
- **Always match PNC brand colors** — use the constants defined above
- **No backend yet** — build features with mock data first, design so a real API can be swapped in later
