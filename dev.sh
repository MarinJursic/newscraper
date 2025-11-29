#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Development Servers...${NC}\n"

# Function to kill all background processes on exit
cleanup() {
    echo -e "\n${BLUE}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Check if frontend dependencies are installed
if [ ! -d "texy/node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    cd texy && npm install && cd ..
fi

# Start backend
echo -e "${BLUE}📡 Starting Backend (FastAPI)...${NC}"
cd backend && python3 main.py &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Start frontend
echo -e "${BLUE}🎨 Starting Frontend (Next.js)...${NC}"
cd texy && npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}✅ Both servers are running!${NC}"
echo -e "${BLUE}Backend:  http://localhost:8000${NC}"
echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
echo -e "\n${BLUE}Press Ctrl+C to stop both servers${NC}\n"

# Wait for background processes
wait
