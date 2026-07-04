# SignSync

AI-powered sign language communication platform — frontend only.

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide React

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    ui/         Reusable primitives (Button, Card, Input, Badge, Logo, Container)
    layout/     Navbar, Footer
    landing/    Hero, Features, HowItWorks, About, CTA
    auth/       AuthLayout, ProtectedRoute
    dashboard/  Sidebar, TopNavbar, StatusCard, CameraPanel, GestureOutputPanel, ActivityHistory
  pages/        LandingPage, LoginPage, RegisterPage, DashboardPage, NotFoundPage
  context/      AuthContext (frontend-only auth, persisted to localStorage)
  data/         Dummy data for dashboard widgets
  lib/          Shared utility functions
  types/        Shared TypeScript types
```

## Notes

- Authentication is frontend-only: `login`/`register` simulate a network call
  and persist a mock user to `localStorage`. Swap the implementation in
  `src/context/AuthContext.tsx` for real API calls when a backend is ready.
- `/dashboard` is guarded by `ProtectedRoute` and redirects unauthenticated
  visitors to `/login`.
- All dashboard data (status metrics, recognized gestures, activity history)
  is static mock data in `src/data/dummyData.ts`, ready to be replaced with
  live data from the AI/backend module.
