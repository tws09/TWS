#!/bin/bash

# Staging Validation Script for Messaging Platform
# This script runs comprehensive validation tests on staging environment

set -e  # Exit on any error

# Configuration
BASE_URL="${STAGING_URL:-https://staging-api.yourdomain.com}"
AUTH_TOKEN=""
CHAT_ID=""
TEST_USER_EMAIL="staging-test@example.com"
TEST_USER_PASSWORD="staging-test-pass"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test result tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_info "Running test: $test_name"
    
    if eval "$test_command"; then
        log_success "✅ $test_name - PASSED"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "❌ $test_name - FAILED"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Health Check Tests
test_api_health() {
    curl -f -s "$BASE_URL/health" > /dev/null
}

test_database_health() {
    curl -f -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/health/db" > /dev/null
}

test_redis_health() {
    curl -f -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/health/redis" > /dev/null
}

test_file_storage_health() {
    curl -f -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/health/storage" > /dev/null
}

# Authentication Tests
test_user_login() {
    local response=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}")
    
    if echo "$response" | grep -q '"success":true'; then
        AUTH_TOKEN=$(echo "$response" | jq -r '.data.token')
        [ "$AUTH_TOKEN" != "null" ] && [ "$AUTH_TOKEN" != "" ]
    else
        return 1
    fi
}

test_token_validation() {
    curl -f -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/auth/validate" > /dev/null
}

# Messaging Tests
test_chat_creation() {
    local response=$(curl -s -X POST "$BASE_URL/api/messaging/chats" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"Staging Test Chat","type":"group","members":[]}')
    
    if echo "$response" | grep -q '"success":true'; then
        CHAT_ID=$(echo "$response" | jq -r '.data._id')
        [ "$CHAT_ID" != "null" ] && [ "$CHAT_ID" != "" ]
    else
        return 1
    fi
}

test_message_sending() {
    local response=$(curl -s -X POST "$BASE_URL/api/messaging/chats/$CHAT_ID/messages" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"content":"Staging validation test message","type":"text"}')
    
    echo "$response" | grep -q '"success":true'
}

test_message_retrieval() {
    local response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
        "$BASE_URL/api/messaging/chats/$CHAT_ID/messages")
    
    echo "$response" | grep -q '"success":true'
}

test_message_editing() {
    # First get a message ID
    local messages_response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
        "$BASE_URL/api/messaging/chats/$CHAT_ID/messages")
    
    local message_id=$(echo "$messages_response" | jq -r '.data[0]._id')
    
    if [ "$message_id" != "null" ] && [ "$message_id" != "" ]; then
        local response=$(curl -s -X PUT "$BASE_URL/api/messaging/messages/$message_id" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"content":"Edited staging test message"}')
        
        echo "$response" | grep -q '"success":true'
    else
        return 1
    fi
}

# File Upload Tests
test_file_upload() {
    # Create a test file
    echo "Staging validation test file content" > /tmp/staging-test-file.txt
    
    local response=$(curl -s -X POST "$BASE_URL/api/files/upload" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -F "file=@/tmp/staging-test-file.txt" \
        -F "chatId=$CHAT_ID")
    
    # Clean up test file
    rm -f /tmp/staging-test-file.txt
    
    echo "$response" | grep -q '"success":true'
}

test_file_download() {
    # Get file ID from upload response (this would need to be stored from previous test)
    local files_response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
        "$BASE_URL/api/files?chatId=$CHAT_ID")
    
    local file_id=$(echo "$files_response" | jq -r '.data[0]._id')
    
    if [ "$file_id" != "null" ] && [ "$file_id" != "" ]; then
        local response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
            "$BASE_URL/api/files/$file_id/download")
        
        [ "$response" != "" ] && [ ${#response} -gt 0 ]
    else
        return 1
    fi
}

# Threading Tests
test_thread_creation() {
    # First send a message to reply to
    local message_response=$(curl -s -X POST "$BASE_URL/api/messaging/chats/$CHAT_ID/messages" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"content":"Parent message for thread","type":"text"}')
    
    local parent_message_id=$(echo "$message_response" | jq -r '.data._id')
    
    if [ "$parent_message_id" != "null" ] && [ "$parent_message_id" != "" ]; then
        local response=$(curl -s -X POST "$BASE_URL/api/messaging/messages/$parent_message_id/reply" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"content":"Thread reply message","type":"text"}')
        
        echo "$response" | grep -q '"success":true'
    else
        return 1
    fi
}

# Pinning Tests
test_message_pinning() {
    # Get a message to pin
    local messages_response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
        "$BASE_URL/api/messaging/chats/$CHAT_ID/messages")
    
    local message_id=$(echo "$messages_response" | jq -r '.data[0]._id')
    
    if [ "$message_id" != "null" ] && [ "$message_id" != "" ]; then
        local response=$(curl -s -X POST "$BASE_URL/api/messaging/messages/$message_id/pin" \
            -H "Authorization: Bearer $AUTH_TOKEN")
        
        echo "$response" | grep -q '"success":true'
    else
        return 1
    fi
}

# Archiving Tests
test_chat_archiving() {
    local response=$(curl -s -X POST "$BASE_URL/api/messaging/chats/$CHAT_ID/archive" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$response" | grep -q '"success":true'
}

test_chat_unarchiving() {
    local response=$(curl -s -X POST "$BASE_URL/api/messaging/chats/$CHAT_ID/unarchive" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$response" | grep -q '"success":true'
}

# Search Tests
test_message_search() {
    local response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
        "$BASE_URL/api/messaging/search?q=staging")
    
    echo "$response" | grep -q '"success":true'
}

# Performance Tests
test_response_times() {
    local start_time=$(date +%s%N)
    curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/api/messaging/chats" > /dev/null
    local end_time=$(date +%s%N)
    
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    # Check if response time is under 500ms
    [ $duration -lt 500 ]
}

# Security Tests
test_unauthorized_access() {
    local response=$(curl -s -H "Authorization: Bearer invalid-token" \
        "$BASE_URL/api/messaging/chats")
    
    # Should return 401 or 403
    echo "$response" | grep -q '"success":false'
}

test_input_validation() {
    # Test with invalid input
    local response=$(curl -s -X POST "$BASE_URL/api/messaging/chats/$CHAT_ID/messages" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"content":"","type":"invalid"}')
    
    # Should return validation error
    echo "$response" | grep -q '"success":false'
}

# Main execution
main() {
    log_info "🚀 Starting Staging Validation for Messaging Platform"
    log_info "Base URL: $BASE_URL"
    echo
    
    # Health Checks
    log_info "📊 Running Health Checks..."
    run_test "API Health Check" test_api_health
    run_test "Database Health Check" test_database_health
    run_test "Redis Health Check" test_redis_health
    run_test "File Storage Health Check" test_file_storage_health
    echo
    
    # Authentication Tests
    log_info "🔐 Running Authentication Tests..."
    run_test "User Login" test_user_login
    run_test "Token Validation" test_token_validation
    echo
    
    # Core Messaging Tests
    log_info "💬 Running Core Messaging Tests..."
    run_test "Chat Creation" test_chat_creation
    run_test "Message Sending" test_message_sending
    run_test "Message Retrieval" test_message_retrieval
    run_test "Message Editing" test_message_editing
    echo
    
    # File Upload/Download Tests
    log_info "📁 Running File Upload/Download Tests..."
    run_test "File Upload" test_file_upload
    run_test "File Download" test_file_download
    echo
    
    # Advanced Features Tests
    log_info "🔧 Running Advanced Features Tests..."
    run_test "Thread Creation" test_thread_creation
    run_test "Message Pinning" test_message_pinning
    run_test "Chat Archiving" test_chat_archiving
    run_test "Chat Unarchiving" test_chat_unarchiving
    run_test "Message Search" test_message_search
    echo
    
    # Performance Tests
    log_info "⚡ Running Performance Tests..."
    run_test "Response Time Check" test_response_times
    echo
    
    # Security Tests
    log_info "🛡️ Running Security Tests..."
    run_test "Unauthorized Access Prevention" test_unauthorized_access
    run_test "Input Validation" test_input_validation
    echo
    
    # Results Summary
    log_info "📋 Test Results Summary"
    log_info "Total Tests: $TOTAL_TESTS"
    log_success "Passed: $TESTS_PASSED"
    
    if [ $TESTS_FAILED -gt 0 ]; then
        log_error "Failed: $TESTS_FAILED"
        echo
        log_error "❌ Staging validation FAILED"
        exit 1
    else
        log_success "✅ All tests PASSED"
        echo
        log_success "🎉 Staging validation SUCCESSFUL"
        exit 0
    fi
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_error "Please install missing dependencies and try again"
        exit 1
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_dependencies
    main "$@"
fi
