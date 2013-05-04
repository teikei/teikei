RSpec.configure do |config|
  config.include Devise::TestHelpers, :type => :controller
  config.skip_session_storage => [:http_auth, :token_auth]
end
