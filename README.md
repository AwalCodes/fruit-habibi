# Fruit Habibi 🥭

A B2B marketplace connecting farmers and importers for fresh produce trading. Built with Next.js and Supabase.

## What it does

This platform helps farmers from Africa and Asia connect directly with importers in the Middle East. Users can list their products, browse available produce, and communicate through real-time messaging.

## Key Features

- User authentication for farmers and importers
- Product listings with images and details
- Real-time chat between buyers and sellers
- Search and filtering by location and product type
- Mobile-responsive design
- Password reset functionality

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for backend (auth, database, realtime)
- **Vercel** for hosting

## Getting Started

### Prerequisites
- Node.js 18 or later
- A Supabase account

### Setup

1. Clone this repo:
```bash
git clone https://github.com/yourusername/fruit-habibi.git
cd fruit-habibi
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Start the dev server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Database Setup

You'll need to set up the database tables in Supabase. The main tables are:
- `users` - User profiles
- `products` - Product listings
- `messages` - Chat messages

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Check code style
- `npm run format` - Format code
- `npm test` - Run tests

## Project Structure

```
src/
├── app/           # Next.js pages
├── components/    # React components
├── contexts/      # React contexts
└── lib/          # Utilities
```

## Contributing

Feel free to open issues or submit pull requests. Make sure to run the linter before submitting.

## License

MIT
