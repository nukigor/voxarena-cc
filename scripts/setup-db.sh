#!/bin/bash

# VoxArena Database Setup Script
# This script sets up the local PostgreSQL database for development

set -e  # Exit on error

echo "🚀 VoxArena Database Setup"
echo "=========================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start PostgreSQL container
echo "📦 Starting PostgreSQL container..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

until docker-compose exec -T postgres pg_isready -U voxarena -d voxarena_dev > /dev/null 2>&1; do
    echo "   Waiting for database..."
    sleep 1
done

echo "✅ PostgreSQL is ready"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "📊 Pushing schema to database..."
npx prisma db push --skip-generate

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run dev' to start the development server"
echo "  2. Run 'npx prisma studio' to open the database GUI"
echo ""
echo "Database connection:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: voxarena_dev"
echo "  User: voxarena"
echo "  Password: voxarena_dev_password"
echo ""
