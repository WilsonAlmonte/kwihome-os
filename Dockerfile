# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client (use dummy URL for build-time generation)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma generate --schema=src/db/prisma/schema.prisma

# Build the application
RUN pnpm build

# Production stage
FROM node:22-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 kwihome

# Copy necessary files from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/db/prisma ./src/db/prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Set ownership
RUN chown -R kwihome:nodejs /app

USER kwihome

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the application (runs migrations first)
CMD ["./docker-entrypoint.sh"]
