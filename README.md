# B2B Real Estate Portal

A luxury-themed B2B real estate portal built with Next.js 14, featuring admin dashboard for inventory management, Channel Partner registration/login, visitor social authentication, price trend visualization, and rating system.

## Features

- **Homepage**: Luxury black theme with hero section, featured properties sidebar, and image slider
- **Property Listings**: Browse properties with filters by category, area, and builder
- **Price Trends**: View historical price data with interactive charts
- **Rating System**: 5-star ratings from Channel Partners and Visitors
- **Admin Dashboard**: Complete inventory management, CP approval, analytics, and settings
- **Channel Partner Portal**: Registration, login, and property browsing
- **Visitor Access**: Social login (Google/Facebook) for quick access
- **Newsletter System**: Template management and campaign sending
- **SEO Optimized**: Meta tags, structured data, and sitemap generation

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Google, Facebook, Email/Password)
- **Styling**: Tailwind CSS with custom luxury black theme
- **Charts**: Recharts for price trend visualization
- **Email**: Nodemailer for SMTP email sending
- **Rich Text**: React Quill for newsletter templates

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Google OAuth credentials (for visitor login)
- Facebook OAuth credentials (for visitor login)
- SMTP credentials (for email functionality)

## Installation

1. **Clone the repository**
   ```bash
   cd "property new"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your credentials:
   - Database connection string
   - NextAuth secret (generate with `openssl rand -base64 32`)
   - OAuth provider credentials
   - SMTP settings

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Create an admin user** (run in Node.js REPL or create a script)
   ```javascript
   const { PrismaClient } = require('@prisma/client');
   const bcrypt = require('bcryptjs');
   const prisma = new PrismaClient();
   
   async function createAdmin() {
     const hashedPassword = await bcrypt.hash('your-admin-password', 10);
     await prisma.user.create({
       data: {
         email: 'admin@example.com',
         name: 'Admin User',
         password: hashedPassword,
         role: 'ADMIN',
       },
     });
   }
   createAdmin();
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
property-new/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (public)/        # Public pages (homepage, projects)
│   ├── (admin)/         # Admin dashboard
│   ├── api/             # API routes
│   └── layout.tsx        # Root layout
├── components/
│   ├── layout/          # Header, Navigation, Footer
│   ├── home/            # Homepage components
│   ├── property/        # Property-related components
│   └── admin/           # Admin dashboard components
├── lib/
│   ├── prisma.ts        # Prisma client
│   └── auth.ts          # NextAuth configuration
├── prisma/
│   └── schema.prisma    # Database schema
└── public/
    └── images/          # Static images
```

## Key Pages

- `/` - Homepage with hero section and featured properties
- `/projects` - Property listings with filters
- `/price-trends` - Price trend visualization
- `/login` - Login page (Admin, CP, or Visitor)
- `/register-cp` - Channel Partner registration
- `/dashboard` - Admin dashboard
- `/dashboard/properties` - Property management
- `/dashboard/channel-partners` - CP approval management
- `/dashboard/settings` - Site settings and configuration

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

The application uses PostgreSQL with the following main models:
- User (Admin, Channel Partner, Visitor)
- Category & SubCategory
- Builder
- Property
- PriceHistory
- Rating
- ChannelPartner
- NewsletterTemplate & NewsletterCampaign
- SiteSettings

## Development

- Run migrations: `npx prisma migrate dev`
- View database: `npx prisma studio`
- Generate Prisma client: `npx prisma generate`

## Production Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Start the server: `npm start`

## License

Proprietary - All rights reserved

