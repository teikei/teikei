# config/initializers/geocoder.rb

Geocoder::Configuration.lookup = :nominatim

# caching (see below for details)
# Geocoder::Configuration.cache = Redis.new
# Geocoder::Configuration.cache_prefix = "..."

# geocoding service request timeout, in seconds (default 3):
Geocoder::Configuration.timeout = 3

# use HTTPS for geocoding service connections:
Geocoder::Configuration.use_https = false

# language to use (for search queries and reverse geocoding):
Geocoder::Configuration.language = :de

# use a proxy to access the service:
# Geocoder::Configuration.http_proxy  = "127.4.4.1"
# Geocoder::Configuration.https_proxy = "127.4.4.2" # only if HTTPS is needed

# caching (see below for details)
# Geocoder::Configuration.cache = Redis.new
# Geocoder::Configuration.cache_prefix = "..."
