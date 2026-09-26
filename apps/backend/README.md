# GestãoMFX Backend

API Node.js/Express para sistema de gestão de fotos com PIX.

## Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start Docker services (PostgreSQL + Redis)
cd ../..
docker-compose up -d

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

Server runs on `http://localhost:3002`

## Available Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build            # Compile TypeScript to JavaScript
npm start                # Run compiled code (for production)
npm run test             # Run Jest tests
npm run test:ci          # Run tests in CI mode
npm run db:migrate       # Create new migration
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (⚠️ deletes all data)
npm run db:studio        # Open Prisma Studio UI
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

## Project Structure

```
src/
├── main.ts                 # Express app entry point
├── config/                 # Environment & database config
├── modules/                # Business logic organized by domain
│   ├── auth/              # Authentication & JWT
│   ├── clients/           # Client CRUD
│   ├── uploads/           # Photo uploads (todo)
│   └── gallery-links/     # Gallery token generation (todo)
├── common/                 # Shared utilities, middleware, types
└── database/              # Prisma schema
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user (requires token)

### Clients
- `POST /api/admin/clients` - Create client
- `GET /api/admin/clients` - List clients (pagination)
- `GET /api/admin/clients/:id` - Get client details
- `PUT /api/admin/clients/:id` - Update client
- `DELETE /api/admin/clients/:id` - Delete client

All endpoints (except login) require Authorization header:
```
Authorization: Bearer <access_token>
```

## Authentication

JWT-based authentication:
- Access token expires in 1 hour
- Refresh token expires in 7 days
- Store tokens securely in frontend

Example login:
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## Database

PostgreSQL with Prisma ORM.

### Key Models
- `User` - Admin users
- `Client` - Customer information
- `Upload` - Photo batches
- `Photo` - Individual photos
- `Payment` - Payment transactions
- `GalleryLink` - Token-based gallery access

## Environment Variables

See `.env.example` for all available options.

## Development Guidelines

- Follow `/CLAUDE.md` conventions
- Write types in TypeScript
- Use Prisma for database queries
- Validate inputs with Joi
- Implement error handling with createError()
- Test critical business logic

## Deployment

Code is auto-deployed to Railway when pushed to main/develop branch.

See root `/docs/DEPLOYMENT.md` for full deployment guide.

---

**Part of GestãoMFX** - Photo management system with PIX payments
