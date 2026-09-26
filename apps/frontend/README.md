# GestãoMFX Frontend

Next.js 14 + React 18 + TailwindCSS

## Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

App runs on `http://localhost:3000`

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── common/      # Shared components
│   └── dashboard/   # Dashboard components
├── services/        # API services
├── hooks/           # Custom React hooks
├── store/           # Zustand state management
├── types/           # TypeScript types
└── styles/          # Global styles
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3002/api)
- `NEXT_PUBLIC_APP_URL` - Frontend URL (default: http://localhost:3000)

## TODO - MVP 1

- [ ] Login page
- [ ] Dashboard layout
- [ ] Clients page (list, create, edit, delete)
- [ ] Protected routes
- [ ] Auth context/store
- [ ] API integration

## TODO - MVP 2

- [ ] Upload page
- [ ] Gallery page

## TODO - MVP 3

- [ ] Payment/checkout page
- [ ] Analytics dashboard

---

**Part of GestãoMFX** - Photo management system with PIX payments
