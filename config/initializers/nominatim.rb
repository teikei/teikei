Nominatim.configure do |config|
  config.email = ENV['EMAIL_SENDER_ADDRESS']
  config.endpoint = 'http://nominatim.openstreetmap.org'
  # config.user_agent       = DEFAULT_USER_AGENT
  config.accept_language  = 'de'
end
