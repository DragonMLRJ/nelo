#!/bin/bash

# Configuration
CONTAINER_NAME="nelo-mysql-prod"
DB_USER="root"
DB_PASS="${MYSQL_ROOT_PASSWORD}" 
BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Dump database
echo "Creating backup of nelo_marketplace_prod..."
docker exec $CONTAINER_NAME mysqldump -u$DB_USER -p$DB_PASS --all-databases > $BACKUP_DIR/db_backup_$DATE.sql

if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_DIR/db_backup_$DATE.sql"
  
  # Optional: Keep only last 7 days backups
  find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete
else
  echo "Backup failed!"
  exit 1
fi
