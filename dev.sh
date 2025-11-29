#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Development Servers...${NC}\n"

# Function to kill existing backend and frontend processes
kill_existing_processes() {
    echo -e "${BLUE}🔍 Checking for existing processes...${NC}"

    # Kill existing backend (Python main.py)
    if pgrep -f "python3 main.py" > /dev/null; then
        echo -e "${BLUE}   Killing existing backend process...${NC}"
        pkill -f "python3 main.py"
        sleep 1
    fi

    # Kill existing frontend (Next.js on port 3000)
    if lsof -ti:3000 > /dev/null 2>&1; then
        echo -e "${BLUE}   Killing existing frontend process on port 3000...${NC}"
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        sleep 1
    fi

    echo -e "${GREEN}✓ Cleanup complete${NC}\n"
}

# Function to kill all background processes on exit
cleanup() {
    echo -e "\n${BLUE}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Kill any existing processes before starting
kill_existing_processes

# Check if frontend dependencies are installed
if [ ! -d "texy/node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    cd texy && npm install && cd ..
fi

# Check for .env file in backend
if [ ! -f "backend/.env" ]; then
    echo -e "${BLUE}⚠️  No .env file found in backend directory${NC}"
    echo -e "${BLUE}   Please copy backend/.env.example to backend/.env and add your API keys${NC}"
    exit 1
fi

# Load environment variables from backend/.env
export $(grep -v '^#' backend/.env | xargs)

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "YOUR_NEW_API_KEY_HERE" ]; then
    echo -e "${BLUE}⚠️  OPENAI_API_KEY is not set in backend/.env${NC}"
    echo -e "${BLUE}   Please edit backend/.env and add your OpenAI API key${NC}"
    exit 1
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
