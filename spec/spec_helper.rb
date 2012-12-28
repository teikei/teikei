require 'rubygems'
require 'spork'
require 'capybara/rspec'
#uncomment the following line to use spork with the debugger
#require 'spork/ext/ruby-debug'

Spork.prefork do
  ENV["RAILS_ENV"] ||= 'test'
  require File.expand_path("../../config/environment", __FILE__)
  require 'rspec/rails'
  require 'rspec/autorun'

  # Requires supporting ruby files with custom matchers and macros, etc,
  # in spec/support/ and its subdirectories.
  Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

  RSpec.configure do |config|

    # mix in factory girl
    config.include FactoryGirl::Syntax::Methods

    # mix in last_response for API tests
    config.include Rack::Test::Methods

    # set up Capybara for request specs
    config.include RequestHelper, type: :request
    config.include Capybara::DSL, type: :request

    # get rid of "should" and use new expectation syntax
    # config.expect_with :rspec do |c|
    #   c.syntax = :expect
    # end

    config.before(:suite) do
      DatabaseCleaner.clean_with(:truncation)
    end

    config.before(:each) do
      DatabaseCleaner.strategy = :truncation
    end

    config.before(:each, js: true) do
      DatabaseCleaner.strategy = :truncation
    end

    config.before(:each) do
      DatabaseCleaner.start
      reset_email
    end

    config.after(:each) do
      DatabaseCleaner.clean
    end

    config.infer_base_class_for_anonymous_controllers = true
    config.order = "random"
    config.treat_symbols_as_metadata_keys_with_true_values = true
    config.filter_run focus: true
    config.run_all_when_everything_filtered = true
    config.use_transactional_fixtures = false
    config.include(MailerHelper)
  end

  # Capybara.javascript_driver = :webkit
end

Spork.each_run do
  FactoryGirl.reload
end
