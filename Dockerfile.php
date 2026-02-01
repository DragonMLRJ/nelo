# PHP Backend Dockerfile for Render.com
FROM php:8.2-apache

# Install PHP extensions and system dependencies
RUN apt-get update && apt-get install -y \
    git \
    zip \
    unzip \
    libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mysqli

# Enable Apache modules
RUN a2enmod rewrite headers

# Configure Apache ServerName
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Set working directory
WORKDIR /var/www/html

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy API files
COPY api/ /var/www/html/

# Install dependencies (suppress warnings)
RUN composer install --no-dev --optimize-autoloader 2>/dev/null || true

# CRITICAL: Configure Apache Directory Permissions
RUN echo '<Directory /var/www/html/>' >> /etc/apache2/apache2.conf && \
    echo '    Options Indexes FollowSymLinks' >> /etc/apache2/apache2.conf && \
    echo '    AllowOverride All' >> /etc/apache2/apache2.conf && \
    echo '    Require all granted' >> /etc/apache2/apache2.conf && \
    echo '</Directory>' >> /etc/apache2/apache2.conf

# Update default VirtualHost to point to /var/www/html
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html|' /etc/apache2/sites-available/000-default.conf && \
    sed -i '/<VirtualHost/a\    <Directory /var/www/html/>\n        Options Indexes FollowSymLinks\n        AllowOverride All\n        Require all granted\n    </Directory>' /etc/apache2/sites-available/000-default.conf

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# RENDER.COM: Configure Apache to use dynamic PORT environment variable
ENV APACHE_RUN_USER=www-data
ENV APACHE_RUN_GROUP=www-data
ENV APACHE_LOG_DIR=/var/log/apache2

# Create a startup script to handle the PORT env var
RUN echo '#!/bin/bash\n\
    PORT=${PORT:-80}\n\
    sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf\n\
    sed -i "s/:80>/:${PORT}>/" /etc/apache2/sites-enabled/000-default.conf\n\
    exec apache2-foreground' > /start.sh && chmod +x /start.sh

# Expose the port
EXPOSE ${PORT:-10000}

# Use the startup script
CMD ["/start.sh"]
