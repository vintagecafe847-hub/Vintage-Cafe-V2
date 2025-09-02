# The Shiplap Shop & Coffee House Website

A beautiful, responsive website for The Shiplap Shop & Coffee House built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🎨 Modern, elegant design with vintage coffee house branding
- 📱 Fully responsive layout
- ✉️ Contact form with email functionality
- 🎯 Smooth animations and interactions
- ⚡ Fast loading with Vite
- 🛡️ Secure Google authentication for admin access
- 📊 Full menu management system with categories and items
- 🌙 Light/Dark mode support for admin panel
- 🔒 Row-level security with Supabase

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Email Service**: Resend.com
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation

## Pages

- **/** - Homepage with hero, about, menu preview, and contact
- **/menu** - Full menu page with categories, search, and pagination
- **/admin** - Secure admin panel for menu management (Google auth required)

## Development

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

   Configure your environment variables in `.env`:

   - Supabase URL and keys
   - Resend API key
   - Google Service Account details

3. **Set up Supabase**:

   - Create a new Supabase project
   - Run the SQL commands from `my-supabase-sql-editor-prompt.txt` in the SQL editor
   - Enable Google OAuth in Authentication > Providers
   - Add your domain to the allowed origins

4. **Start development server**:

   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Email Setup

See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed instructions on configuring the contact form email functionality.

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `RESEND_API_KEY` environment variable in Vercel dashboard
4. Deploy!

The contact form will automatically work in production with the API endpoints.

## Project Structure

```
src/
├── components/          # React components
├── data/               # Static data files
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles

api/                    # Vercel API functions
└── send-contact-email.js  # Contact form handler

public/                 # Static assets
├── icons/             # SVG icons
└── images/            # Photos and images
```

## License

This project is private and proprietary.
