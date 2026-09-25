FROM webdevops/php-nginx:8.3

# Set the document root for NGINX to Laravel's public folder
ENV WEB_DOCUMENT_ROOT=/app/public
ENV WEB_DOCUMENT_INDEX=index.php
ENV APP_ENV=production

WORKDIR /app
COPY . /app

# Install dependencies using Composer
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Give the correct permissions to the web server user (application)
RUN chown -R application:application /app/storage /app/bootstrap/cache /app/database

# Automatically run Laravel caching and migrations when the server starts
RUN echo '#!/bin/sh\n\
php artisan config:cache\n\
php artisan route:cache\n\
php artisan view:cache\n\
php artisan migrate --force\n\
' > /opt/docker/provision/entrypoint.d/20-laravel-setup.sh

RUN chmod +x /opt/docker/provision/entrypoint.d/20-laravel-setup.sh
