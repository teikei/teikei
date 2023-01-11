FROM php:7.4.11-fpm

RUN apt-get update \
    && apt-get install -y libpq-dev curl git zlib1g-dev wget git supervisor cron \
    && docker-php-ext-install pdo_pgsql

RUN apt-get update \
     && apt-get install -y libzip-dev libxml2-dev libmcrypt-dev libmemcached-dev imagemagick libmagickwand-dev

RUN docker-php-ext-configure pcntl --enable-pcntl
RUN docker-php-ext-install pdo pdo_pgsql tokenizer xml pcntl posix zip

RUN pecl channel-update pecl.php.net && \
  pecl install mcrypt && \
  pecl install memcached && \
  pecl install imagick && \
  pecl install redis && \
  docker-php-ext-enable mcrypt && \
  docker-php-ext-enable memcached && \
  docker-php-ext-enable imagick && \
  docker-php-ext-configure opcache --enable-opcache && \
  docker-php-ext-install opcache && \
  docker-php-ext-enable redis && \
  mkdir -p /var/www \

ENV COMPOSER_ALLOW_SUPERUSER=1

COPY opcache.ini $PHP_INI_DIR
COPY php.ini $PHP_INI_DIR

# Setup sendportal
WORKDIR /app
RUN git clone --depth 1 --branch v2.0.0 https://github.com/mettle/sendportal.git .
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
RUN composer install
RUN chmod +x /app/artisan
RUN chown -R www-data:www-data /app/storage

# Publish laravel horizon assets
RUN /app/artisan horizon:publish

# Add SendPortal cron jobs that runs every minute
#RUN echo '* * * * * php /app/artisan schedule:run >> /dev/null 2>&1' > /etc/crontabs/root
#RUN echo '* * * * * php /app/artisan sp:campaigns:dispatch >> /dev/null 2>&1' >> /etc/crontabs/root \

 ENTRYPOINT ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]

