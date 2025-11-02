#!/bin/bash

# InsurAgent Pro - Development Startup Script
# This script starts both frontend and backend servers

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║          🚀 InsurAgent Pro - Starting Dev 🚀          ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check if .env files exist
if [ ! -f .env ]; then
    echo "⚠️  Frontend .env file not found!"
    echo "   Creating from .env.example..."
    cp .env.example .env
    echo "   ✅ Created .env - Please edit with your credentials"
    echo ""
fi

if [ ! -f backend/.env ]; then
    echo "⚠️  Backend .env file not found!"
    echo "   Creating from backend/.env.example..."
    cp backend/.env.example backend/.env
    echo "   ✅ Created backend/.env - Please edit with your credentials"
    echo ""
fi

# Check for required environment variables
echo "🔍 Checking environment configuration..."
if grep -q "your-project.supabase.co" .env 2>/dev/null; then
    echo "⚠️  Warning: Frontend .env still has placeholder values"
    echo "   Please update .env with your actual Supabase credentials"
    echo ""
fi

if grep -q "your-project.supabase.co" backend/.env 2>/dev/null; then
    echo "⚠️  Warning: Backend .env still has placeholder values"
    echo "   Please update backend/.env with your actual credentials"
    echo ""
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed"
    echo ""
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
    echo "✅ Backend dependencies installed"
    echo ""
fi

echo "🚀 Starting servers..."
echo ""

# Start backend in background
echo "Starting backend server on port 3001..."
cd backend && npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start. Check backend.log for errors"
    exit 1
fi

echo ""

# Start frontend in foreground
echo "Starting frontend server on port 3000..."
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║  🎉 InsurAgent Pro is starting!                      ║"
echo "║                                                       ║"
echo "║  Frontend: http://localhost:3000                     ║"
echo "║  Backend:  http://localhost:3001/api                 ║"
echo "║                                                       ║"
echo "║  Press Ctrl+C to stop all servers                    ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Trap Ctrl+C to kill both processes
trap 'echo ""; echo "🛑 Stopping servers..."; kill $BACKEND_PID 2>/dev/null; echo "✅ Servers stopped"; exit 0' INT

# Start frontend (this will run in foreground)
npm run dev

# If frontend exits, kill backend
kill $BACKEND_PID 2>/dev/null

