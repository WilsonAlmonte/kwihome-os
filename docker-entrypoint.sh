#!/bin/sh
set -e

echo "=========================================="
echo "Starting KwiHome OS"
echo "=========================================="
echo ""
echo "[$(date)] Running database migrations..."
npx prisma migrate deploy --schema=src/db/prisma/schema.prisma
echo ""
echo "[$(date)] Migrations completed successfully"
echo "=========================================="
echo ""
echo "[$(date)] Starting application..."
exec node .output/server/index.mjs
