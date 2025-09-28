# Fruit Habibi

A production-grade B2B fruits & vegetables marketplace connecting African & Asian farmers/exporters with Middle-East importers and distributors.

## Features

- **Role-based Authentication**: Farmers/Exporters and Importers/Distributors
- **Product Listings**: Create, edit, and manage fruit & vegetable listings
- **Real-time Messaging**: Direct communication between buyers and sellers
- **Search & Filter**: Find products by location, type, and availability
- **Admin Panel**: User and listing moderation
- **Mobile-first Design**: Responsive and accessible interface

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Headless UI, Framer Motion
- **Backend**: Supabase (Auth, Database, Realtime, Storage)
- **Deployment**: Vercel
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fruit-habibi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # Reusable UI components
├── lib/                 # Utilities and configurations
├── types/               # TypeScript type definitions
└── hooks/               # Custom React hooks
```

## Deployment

The application is configured for deployment on Vercel. Set up your environment variables in the Vercel dashboard and deploy.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request
