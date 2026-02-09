#!/bin/bash
# Quick rollback script for Blue-Green deployment
# Usage: ./rollback.sh

set -e

PROJECT_PATH="/home/ubuntu/ilchul"
cd "$PROJECT_PATH"

echo "=== Blue-Green Rollback ==="

# Get current active environment
if [ -f current_environment.txt ]; then
    CURRENT_ENV=$(cat current_environment.txt)
else
    echo "❌ current_environment.txt not found"
    exit 1
fi

# Determine rollback target (opposite of current)
if [ "$CURRENT_ENV" = "blue" ]; then
    ROLLBACK_ENV="green"
else
    ROLLBACK_ENV="blue"
fi

echo "Current active environment: $CURRENT_ENV"
echo "Rolling back to: $ROLLBACK_ENV"
echo ""

# Check if rollback target is running
if [ "$ROLLBACK_ENV" = "blue" ]; then
    CHECK_PORT=8080
else
    CHECK_PORT=8081
fi

echo "Checking if $ROLLBACK_ENV environment is available..."
if ! curl -f http://localhost:$CHECK_PORT/health 2>/dev/null; then
    echo "❌ $ROLLBACK_ENV environment is not running or not healthy"
    echo "Cannot rollback to an environment that is not running"
    exit 1
fi

echo "✅ $ROLLBACK_ENV environment is healthy"
echo ""

# Confirm rollback
read -p "Are you sure you want to rollback to $ROLLBACK_ENV? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

echo ""
echo "=== Switching traffic to $ROLLBACK_ENV ==="

# Switch traffic by updating nginx symlinks
docker exec nginx_server ln -sf /etc/nginx/conf.d/active-backend-${ROLLBACK_ENV}.conf /etc/nginx/conf.d/active-backend.conf
docker exec nginx_server ln -sf /etc/nginx/conf.d/active-frontend-${ROLLBACK_ENV}.conf /etc/nginx/conf.d/active-frontend.conf

# Gracefully reload nginx
docker exec nginx_server nginx -s reload

# Update current environment marker
echo "$ROLLBACK_ENV" > current_environment.txt

echo "✅ Traffic switched to $ROLLBACK_ENV"
echo ""

# Final health check
echo "=== Final health check ==="
sleep 3

if curl -f http://il-chul.com 2>/dev/null; then
    echo "✅ Production site is accessible"
else
    echo "⚠️ Production site check failed - investigate immediately"
fi

if curl -f http://il-chul.com/health 2>/dev/null; then
    echo "✅ Production API is healthy"
else
    echo "⚠️ Production API health check failed - investigate immediately"
fi

echo ""
echo "🎉 Rollback completed!"
echo "Active environment: $ROLLBACK_ENV"
echo "🌐 Site: http://il-chul.com"
