#!/bin/bash

# Backend Testing Script
# This script tests all major backend endpoints

API_BASE="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "🧪 Property Broker Backend Test Script"
echo "========================================="
echo ""

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/health")
if [ "$HEALTH_RESPONSE" == "200" ]; then
    print_success "Health check passed (HTTP $HEALTH_RESPONSE)"
else
    print_error "Health check failed (HTTP $HEALTH_RESPONSE)"
    print_info "Make sure the backend server is running on port 5000"
    exit 1
fi
echo ""

# Test 2: Register a test user
echo "2️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "fullName": "Test User",
        "phoneNumber": "+919876543210",
        "email": "testuser@example.com",
        "password": "Test@123"
    }')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    print_success "Registration successful"
    echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
else
    print_info "Registration response (may already exist):"
    echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
fi
echo ""

# Test 3: Login with test user
echo "3️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "testuser@example.com",
        "password": "Test@123"
    }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    print_success "Login successful"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)
    echo "Token: ${TOKEN:0:50}..."
    echo ""
    
    # Test 4: Get Profile
    echo "4️⃣  Testing Get Profile (with authentication)..."
    PROFILE_RESPONSE=$(curl -s -X GET "$API_BASE/auth/profile" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$PROFILE_RESPONSE" | grep -q "email"; then
        print_success "Profile fetch successful"
        echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
    else
        print_error "Profile fetch failed"
        echo "$PROFILE_RESPONSE"
    fi
else
    print_error "Login failed"
    echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
fi
echo ""

# Test 5: Test Admin Login
echo "5️⃣  Testing Admin Login..."
ADMIN_LOGIN=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@propertybroker.com",
        "password": "Admin@123"
    }')

if echo "$ADMIN_LOGIN" | grep -q "token"; then
    print_success "Admin login successful"
    ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.token' 2>/dev/null)
    echo "Admin Token: ${ADMIN_TOKEN:0:50}..."
else
    print_error "Admin login failed"
    echo "$ADMIN_LOGIN" | jq '.' 2>/dev/null || echo "$ADMIN_LOGIN"
fi
echo ""

# Test 6: Test Subscription Plans
echo "6️⃣  Testing Subscription Plans..."
if [ ! -z "$TOKEN" ]; then
    PLANS_RESPONSE=$(curl -s -X GET "$API_BASE/subscriptions/plans" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$PLANS_RESPONSE" | grep -q "monthly\|quarterly\|plans"; then
        print_success "Subscription plans fetched"
        echo "$PLANS_RESPONSE" | jq '.' 2>/dev/null || echo "$PLANS_RESPONSE"
    else
        print_error "Failed to fetch subscription plans"
        echo "$PLANS_RESPONSE"
    fi
else
    print_info "Skipping subscription test (no token available)"
fi
echo ""

# Test 7: MongoDB Connection Check
echo "7️⃣  Testing MongoDB Connection..."
MONGO_CHECK=$(pgrep -x mongod)
if [ ! -z "$MONGO_CHECK" ]; then
    print_success "MongoDB is running (PID: $MONGO_CHECK)"
else
    print_error "MongoDB process not found - is it running?"
    print_info "Start MongoDB with: sudo systemctl start mongod"
fi
echo ""

# Summary
echo "========================================="
echo "✨ Backend Test Summary"
echo "========================================="
print_info "Backend URL: $API_BASE"
print_info "If any tests failed, check the server logs"
print_info "Server should be running with: npm run dev"
echo ""
