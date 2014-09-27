require 'rubygems'

ENV['RAILS_ENV'] = 'test'
require File.expand_path('../../config/environment', __FILE__)
require 'rspec/rails'
require 'capybara/rspec'
require 'coveralls'

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join('spec/support/**/*.rb')].each {|f| require f}

RSpec.configure do |config|

  # mix in factory girl
  config.include FactoryGirl::Syntax::Methods

  # mix in last_response for API tests
  config.include Rack::Test::Methods, type: :request

  config.include ResponseHelper, type: :request
  config.include SessionHelper, type: :feature
  config.include ApiSessionHelper, type: :request
  config.include GeocodingHelper, type: :request

  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each) do
    DatabaseCleaner.start
    reset_email
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end

  config.infer_base_class_for_anonymous_controllers = true
  config.order = 'random'
  config.filter_run focus: true
  config.run_all_when_everything_filtered = true
  config.use_transactional_fixtures = false
  config.include(MailerHelper)
end

# Capybara.javascript_driver = :webkit
Coveralls.wear!
