#!/bin/bash

echo "🔨 Building Grind2Glory Full-Stack App..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd ../client
npm install

echo "🏗️ Building React frontend..."
npm run build

echo "✅ Build complete!"