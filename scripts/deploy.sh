#!/bin/bash

# Ensure we have the latest code
git pull origin main

# Rebuild and restart containers
echo "Building and restarting containers..."
docker-compose -f docker-compose.prod.yml up -d --build --remove-orphans

# Clean up unused images
echo "Cleaning up old images..."
docker image prune -f

echo "Deployment complete!"
