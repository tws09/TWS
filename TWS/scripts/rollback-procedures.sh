#!/bin/bash

# Rollback Procedures for Messaging Platform
# Comprehensive rollback scripts for different scenarios

set -e  # Exit on any error

# Configuration
NAMESPACE="${NAMESPACE:-default}"
APP_NAME="${APP_NAME:-messaging-platform}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
LOG_FILE="${LOG_FILE:-/var/log/rollback.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Utility functions
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Command '$1' not found. Please install it and try again."
        exit 1
    fi
}

confirm_action() {
    local message="$1"
    echo -e "${YELLOW}$message${NC}"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Action cancelled by user"
        exit 0
    fi
}

# Feature Toggle Rollback
rollback_feature_toggles() {
    log_info "🔄 Rolling back feature toggles..."
    
    # Disable new features
    kubectl patch configmap feature-flags -n "$NAMESPACE" -p '{"data":{"NEW_MESSAGING_FEATURE":"false"}}' || {
        log_error "Failed to disable NEW_MESSAGING_FEATURE"
        return 1
    }
    
    kubectl patch configmap feature-flags -n "$NAMESPACE" -p '{"data":{"E2E_ENCRYPTION":"false"}}' || {
        log_error "Failed to disable E2E_ENCRYPTION"
        return 1
    }
    
    kubectl patch configmap feature-flags -n "$NAMESPACE" -p '{"data":{"ADVANCED_THREADING":"false"}}' || {
        log_error "Failed to disable ADVANCED_THREADING"
        return 1
    }
    
    # Restart services to pick up new config
    kubectl rollout restart deployment messaging-service -n "$NAMESPACE" || {
        log_error "Failed to restart messaging-service"
        return 1
    }
    
    kubectl rollout restart deployment api-gateway -n "$NAMESPACE" || {
        log_error "Failed to restart api-gateway"
        return 1
    }
    
    # Wait for rollback to complete
    kubectl rollout status deployment messaging-service -n "$NAMESPACE" --timeout=300s || {
        log_error "Messaging service rollback timeout"
        return 1
    }
    
    kubectl rollout status deployment api-gateway -n "$NAMESPACE" --timeout=300s || {
        log_error "API gateway rollback timeout"
        return 1
    }
    
    log_success "✅ Feature toggles rolled back successfully"
}

# Database Rollback
rollback_database() {
    local target_version="$1"
    
    if [ -z "$target_version" ]; then
        log_error "Target version not specified for database rollback"
        return 1
    fi
    
    log_info "🗄️ Rolling back database to version: $target_version"
    
    # Create backup before rollback
    local backup_name="pre-rollback-$(date +%Y%m%d-%H%M%S)"
    log_info "Creating backup: $backup_name"
    
    if command -v mongodump &> /dev/null; then
        mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/$backup_name" || {
            log_error "Failed to create database backup"
            return 1
        }
        log_success "Database backup created: $backup_name"
    else
        log_warning "mongodump not available, skipping backup"
    fi
    
    # Run migration rollback
    cd backend || {
        log_error "Backend directory not found"
        return 1
    }
    
    npm run migrate:down -- --to "$target_version" || {
        log_error "Database migration rollback failed"
        return 1
    }
    
    # Verify rollback
    npm run migrate:status || {
        log_error "Failed to verify migration status"
        return 1
    }
    
    log_success "✅ Database rolled back to version: $target_version"
}

# Application Rollback
rollback_application() {
    local target_revision="$1"
    
    log_info "🔄 Rolling back application..."
    
    if [ -n "$target_revision" ]; then
        log_info "Rolling back to specific revision: $target_revision"
        kubectl rollout undo deployment messaging-service -n "$NAMESPACE" --to-revision="$target_revision" || {
            log_error "Failed to rollback messaging-service to revision $target_revision"
            return 1
        }
        kubectl rollout undo deployment api-gateway -n "$NAMESPACE" --to-revision="$target_revision" || {
            log_error "Failed to rollback api-gateway to revision $target_revision"
            return 1
        }
        kubectl rollout undo deployment file-service -n "$NAMESPACE" --to-revision="$target_revision" || {
            log_error "Failed to rollback file-service to revision $target_revision"
            return 1
        }
    else
        log_info "Rolling back to previous revision"
        kubectl rollout undo deployment messaging-service -n "$NAMESPACE" || {
            log_error "Failed to rollback messaging-service"
            return 1
        }
        kubectl rollout undo deployment api-gateway -n "$NAMESPACE" || {
            log_error "Failed to rollback api-gateway"
            return 1
        }
        kubectl rollout undo deployment file-service -n "$NAMESPACE" || {
            log_error "Failed to rollback file-service"
            return 1
        }
    fi
    
    # Wait for rollback to complete
    kubectl rollout status deployment messaging-service -n "$NAMESPACE" --timeout=600s || {
        log_error "Messaging service rollback timeout"
        return 1
    }
    
    kubectl rollout status deployment api-gateway -n "$NAMESPACE" --timeout=600s || {
        log_error "API gateway rollback timeout"
        return 1
    }
    
    kubectl rollout status deployment file-service -n "$NAMESPACE" --timeout=600s || {
        log_error "File service rollback timeout"
        return 1
    }
    
    log_success "✅ Application rolled back successfully"
}

# Configuration Rollback
rollback_configuration() {
    log_info "⚙️ Rolling back configuration..."
    
    # Rollback environment variables
    if [ -f "$BACKUP_DIR/env-backup.env" ]; then
        log_info "Restoring environment variables from backup"
        kubectl create configmap app-config -n "$NAMESPACE" --from-env-file="$BACKUP_DIR/env-backup.env" --dry-run=client -o yaml | kubectl apply -f - || {
            log_error "Failed to restore environment variables"
            return 1
        }
    else
        log_warning "No environment backup found, skipping env rollback"
    fi
    
    # Rollback secrets
    if [ -f "$BACKUP_DIR/secrets-backup.yaml" ]; then
        log_info "Restoring secrets from backup"
        kubectl apply -f "$BACKUP_DIR/secrets-backup.yaml" || {
            log_error "Failed to restore secrets"
            return 1
        }
    else
        log_warning "No secrets backup found, skipping secrets rollback"
    fi
    
    log_success "✅ Configuration rolled back successfully"
}

# Health Check Verification
verify_rollback() {
    log_info "🔍 Verifying rollback..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts"
        
        # Check pod status
        local ready_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME" --field-selector=status.phase=Running | wc -l)
        local total_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME" | wc -l)
        
        if [ "$ready_pods" -eq "$total_pods" ] && [ "$ready_pods" -gt 0 ]; then
            log_success "All pods are running"
            break
        else
            log_warning "Pods not ready yet ($ready_pods/$total_pods)"
            sleep 10
            attempt=$((attempt + 1))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "Health check timeout - pods not ready after $max_attempts attempts"
        return 1
    fi
    
    # Test API endpoints
    local api_url="${API_URL:-https://api.yourdomain.com}"
    local auth_token="${AUTH_TOKEN:-}"
    
    if [ -n "$auth_token" ]; then
        # Test health endpoint
        local health_response=$(curl -s -o /dev/null -w "%{http_code}" "$api_url/health")
        if [ "$health_response" = "200" ]; then
            log_success "Health endpoint responding"
        else
            log_error "Health endpoint not responding (HTTP $health_response)"
            return 1
        fi
        
        # Test core functionality
        local chats_response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $auth_token" "$api_url/api/messaging/chats")
        if [ "$chats_response" = "200" ]; then
            log_success "Core API functionality working"
        else
            log_error "Core API functionality not working (HTTP $chats_response)"
            return 1
        fi
    else
        log_warning "No auth token provided, skipping API tests"
    fi
    
    log_success "✅ Rollback verification completed successfully"
}

# Performance Check
check_performance() {
    log_info "⚡ Checking performance metrics..."
    
    local api_url="${API_URL:-https://api.yourdomain.com}"
    local auth_token="${AUTH_TOKEN:-}"
    
    if [ -n "$auth_token" ]; then
        # Measure response time
        local start_time=$(date +%s%N)
        curl -s -H "Authorization: Bearer $auth_token" "$api_url/api/messaging/chats" > /dev/null
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
        
        if [ $response_time -lt 1000 ]; then
            log_success "Response time acceptable: ${response_time}ms"
        else
            log_warning "Response time high: ${response_time}ms"
        fi
    else
        log_warning "No auth token provided, skipping performance check"
    fi
}

# Emergency Rollback (Critical Issues)
emergency_rollback() {
    log_error "🚨 EMERGENCY ROLLBACK INITIATED"
    confirm_action "This will perform an immediate rollback. Are you sure?"
    
    log_info "Performing emergency rollback sequence..."
    
    # 1. Disable all new features immediately
    rollback_feature_toggles || {
        log_error "Feature toggle rollback failed"
        return 1
    }
    
    # 2. Rollback application to previous version
    rollback_application || {
        log_error "Application rollback failed"
        return 1
    }
    
    # 3. Verify basic functionality
    verify_rollback || {
        log_error "Rollback verification failed"
        return 1
    }
    
    log_success "🚨 Emergency rollback completed"
}

# Complete Rollback (Full System)
complete_rollback() {
    local db_version="$1"
    local app_revision="$2"
    
    log_warning "🔄 COMPLETE SYSTEM ROLLBACK"
    confirm_action "This will rollback the entire system. Are you sure?"
    
    log_info "Performing complete rollback sequence..."
    
    # 1. Feature toggles
    rollback_feature_toggles || {
        log_error "Feature toggle rollback failed"
        return 1
    }
    
    # 2. Application
    rollback_application "$app_revision" || {
        log_error "Application rollback failed"
        return 1
    }
    
    # 3. Database (if version specified)
    if [ -n "$db_version" ]; then
        rollback_database "$db_version" || {
            log_error "Database rollback failed"
            return 1
        }
    fi
    
    # 4. Configuration
    rollback_configuration || {
        log_error "Configuration rollback failed"
        return 1
    }
    
    # 5. Verification
    verify_rollback || {
        log_error "Rollback verification failed"
        return 1
    }
    
    # 6. Performance check
    check_performance || {
        log_warning "Performance check failed, but rollback completed"
    }
    
    log_success "🔄 Complete rollback completed successfully"
}

# Create Backup
create_backup() {
    log_info "💾 Creating system backup..."
    
    local backup_timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_dir="$BACKUP_DIR/backup-$backup_timestamp"
    
    mkdir -p "$backup_dir" || {
        log_error "Failed to create backup directory"
        return 1
    }
    
    # Backup environment variables
    kubectl get configmap app-config -n "$NAMESPACE" -o yaml > "$backup_dir/env-backup.yaml" || {
        log_warning "Failed to backup environment config"
    }
    
    # Backup secrets
    kubectl get secrets -n "$NAMESPACE" -o yaml > "$backup_dir/secrets-backup.yaml" || {
        log_warning "Failed to backup secrets"
    }
    
    # Backup deployment history
    kubectl rollout history deployment messaging-service -n "$NAMESPACE" > "$backup_dir/messaging-service-history.txt" || {
        log_warning "Failed to backup messaging service history"
    }
    
    kubectl rollout history deployment api-gateway -n "$NAMESPACE" > "$backup_dir/api-gateway-history.txt" || {
        log_warning "Failed to backup API gateway history"
    }
    
    # Backup database (if mongodump available)
    if command -v mongodump &> /dev/null && [ -n "$MONGO_URI" ]; then
        mongodump --uri="$MONGO_URI" --out="$backup_dir/database" || {
            log_warning "Failed to backup database"
        }
    else
        log_warning "mongodump not available or MONGO_URI not set, skipping database backup"
    fi
    
    log_success "✅ Backup created: $backup_dir"
    echo "$backup_dir" > "$BACKUP_DIR/latest-backup.txt"
}

# Show Rollback Options
show_rollback_options() {
    echo "🔄 Messaging Platform Rollback Options"
    echo "======================================"
    echo
    echo "1. Emergency Rollback (Critical Issues)"
    echo "   - Disable feature toggles"
    echo "   - Rollback to previous application version"
    echo "   - Quick verification"
    echo
    echo "2. Feature Toggle Rollback"
    echo "   - Disable new features only"
    echo "   - Keep current application version"
    echo
    echo "3. Application Rollback"
    echo "   - Rollback to previous application version"
    echo "   - Keep current database and config"
    echo
    echo "4. Database Rollback"
    echo "   - Rollback database migrations"
    echo "   - Requires target version"
    echo
    echo "5. Complete System Rollback"
    echo "   - Rollback everything (app, db, config)"
    echo "   - Most comprehensive option"
    echo
    echo "6. Create Backup"
    echo "   - Create system backup before rollback"
    echo
    echo "7. Verify Current State"
    echo "   - Check system health and performance"
    echo
}

# Main function
main() {
    local action="$1"
    local param1="$2"
    local param2="$3"
    
    # Check required commands
    check_command kubectl
    check_command curl
    
    # Create log file
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    
    log_info "🔄 Starting rollback procedure: $action"
    log_info "Timestamp: $(date)"
    log_info "Namespace: $NAMESPACE"
    log_info "App Name: $APP_NAME"
    
    case "$action" in
        "emergency")
            emergency_rollback
            ;;
        "features")
            rollback_feature_toggles
            verify_rollback
            ;;
        "app")
            rollback_application "$param1"
            verify_rollback
            ;;
        "database")
            if [ -z "$param1" ]; then
                log_error "Database version required for database rollback"
                echo "Usage: $0 database <version>"
                exit 1
            fi
            rollback_database "$param1"
            verify_rollback
            ;;
        "complete")
            complete_rollback "$param1" "$param2"
            ;;
        "backup")
            create_backup
            ;;
        "verify")
            verify_rollback
            check_performance
            ;;
        "help"|"--help"|"-h"|"")
            show_rollback_options
            ;;
        *)
            log_error "Unknown action: $action"
            show_rollback_options
            exit 1
            ;;
    esac
    
    log_success "🎉 Rollback procedure completed successfully"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
