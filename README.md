# KwiHome OS

A self-hosted home management application designed for household use on mobile and tablet devices. Manage your inventory, shopping lists, tasks, and notes—all organized by rooms in your home.

## Features

- **🏠 Home Areas (Rooms)** - Organize everything by physical spaces in your home
- **📦 Inventory Management** - Track household items and their stock status
- **🛒 Shopping Lists** - Automatically generate shopping lists from out-of-stock items
- **✅ Tasks** - Manage household tasks with due dates and priorities
- **📝 Notes** - Keep household notes organized by room

## Tech Stack

- **Frontend**: React 19, TanStack Router, TanStack Query, TanStack Form
- **Backend**: TanStack Start (Nitro), Server Functions
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4, Radix UI components
- **Architecture**: Clean Architecture with Repository Pattern

## Self-Hosting with Docker (Recommended)

The easiest way to deploy KwiHome OS is using Docker Compose.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

### Quick Start

1. Clone the repository:

   \`\`\`bash
   git clone https://github.com/WilsonAlmonte/kwihome-os.git
   cd kwihome-os
   \`\`\`

2. Create an environment file:

   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Edit the `.env` file and set a secure password:

   \`\`\`env
   POSTGRES_USER=kwihome
   POSTGRES_PASSWORD=your-secure-password
   POSTGRES_DB=kwihome
   PORT=3000
   \`\`\`

4. Start the application:

   \`\`\`bash
   docker compose up -d
   \`\`\`

5. The application will be available at `http://localhost:3000`

### Docker Compose Services

| Service   | Description                                       |
| --------- | ------------------------------------------------- |
| `app`     | KwiHome OS application                            |
| `db`      | PostgreSQL 16 database with persistent storage    |
| `migrate` | Runs database migrations automatically on startup |

### Managing the Application

\`\`\`bash

# View logs

docker compose logs -f app

# Stop the application

docker compose down

# Stop and remove all data (⚠️ destructive)

docker compose down -v

# Update to latest version

git pull
docker compose build
docker compose up -d
\`\`\`

### Environment Variables

| Variable            | Description              | Default   |
| ------------------- | ------------------------ | --------- |
| `POSTGRES_USER`     | PostgreSQL username      | `kwihome` |
| `POSTGRES_PASSWORD` | PostgreSQL password      | `kwihome` |
| `POSTGRES_DB`       | PostgreSQL database name | `kwihome` |
| `PORT`              | Application port         | `3000`    |
| `DB_PORT`           | PostgreSQL exposed port  | `5432`    |

## Local Development

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL database

### Setup

1. Install dependencies:

   \`\`\`bash
   pnpm install
   \`\`\`

2. Set up environment variables:

   \`\`\`bash
   cp .env.example .env

   # Edit .env with your database connection string

   # DATABASE_URL=postgresql://user:password@localhost:5432/kwihome

   \`\`\`

3. Generate Prisma client:

   \`\`\`bash
   pnpm prisma generate --schema=src/db/prisma/schema.prisma
   \`\`\`

4. Run database migrations:

   \`\`\`bash
   pnpm prisma migrate dev --schema=src/db/prisma/schema.prisma
   \`\`\`

5. Start the development server:

   \`\`\`bash
   pnpm dev
   \`\`\`

6. Open `http://localhost:3000`

### Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Start development server |
| `pnpm build` | Build for production     |
| `pnpm serve` | Preview production build |
| `pnpm test`  | Run tests with Vitest    |

## Project Structure

\`\`\`
src/
├── app/ # Presentation layer (React)
│ ├── components/ # UI components
│ ├── features/ # Feature-specific services & hooks
│ ├── hooks/ # Shared React hooks
│ ├── lib/ # Utilities
│ └── routes/ # File-based routing
├── db/ # Database layer
│ └── prisma/ # Schema & migrations
├── di/ # Dependency injection container
├── features/ # Domain layer
│ ├── home-areas/ # Entities, ports, use cases
│ ├── inventory/
│ ├── notes/
│ ├── shopping-lists/
│ └── tasks/
└── infrastructure/ # Data access layer
└── prisma/ # Repository implementations
\`\`\`

## Documentation

- [Architecture & Design Patterns](./docs/ARCHITECTURE.md)
- [Feature Flows](./docs/FEATURES.md)

## License

MIT
