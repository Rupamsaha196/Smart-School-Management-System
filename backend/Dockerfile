FROM richarvey/nginx-php-fpm:3.1.6

COPY . .

# Set environment variables for the image
ENV WEBROOT /var/www/html/public
ENV PHP_ERRORS_STDERR 1
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1
ENV COMPOSER_ALLOW_SUPERUSER 1

# Install dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Setup permissions
RUN chmod -R 777 storage bootstrap/cache database

# Create a startup script to run migrations and caching
RUN echo '#!/bin/sh\n\
php artisan config:cache\n\
php artisan route:cache\n\
php artisan view:cache\n\
php artisan migrate --force\n\
' > /var/www/html/scripts/00-laravel-deploy.sh

RUN chmod +x /var/www/html/scripts/00-laravel-deploy.sh
