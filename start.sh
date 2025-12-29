#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Delhi Real Estate PDF Parser Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check MongoDB
echo -e "${BLUE}Checking MongoDB...${NC}"
if systemctl is-active --quiet mongod; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${RED}✗ MongoDB is not running${NC}"
    echo "Starting MongoDB..."
    sudo systemctl start mongod
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting Backend Server${NC}"
echo -e "${BLUE}========================================${NC}"

# Kill any existing processes
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start backend in background
cd "$(dirname "$0")/server"
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

echo "Backend starting... (PID: $BACKEND_PID)"
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running on http://localhost:5000${NC}"
else
    echo -e "${RED}✗ Backend failed to start. Check backend.log${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting Frontend${NC}"
echo -e "${BLUE}========================================${NC}"

# Start frontend in background
cd ../client
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Frontend starting... (PID: $FRONTEND_PID)"
echo "Waiting for frontend to start..."
sleep 5

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📊 ${BLUE}Backend:${NC}  http://localhost:5000/api/health"
echo -e "🌐 ${BLUE}Frontend:${NC} http://localhost:3000"
echo ""
echo -e "${BLUE}Admin Login:${NC}"
echo -e "  Email: admin@propertybroker.com"
echo -e "  Password: admin123"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Login as admin"
echo "  3. Upload properties.pdf"
echo "  4. Register as user and search properties"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
