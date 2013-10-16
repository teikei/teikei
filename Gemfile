source 'https://rubygems.org'

gem 'rails', '~> 3.2.13'
gem 'activeadmin', '~> 0.5.1'
gem 'meta_search', '~> 1.1.0.pre'
gem 'geocoder', '~> 1.1.6'
gem 'thin', '~> 1.5.0'
gem 'devise', '~> 2.2.2'
gem 'devise-i18n-views', '~> 0.2.5'
gem 'cancan', '~> 1.6.8'
gem 'rolify', '~> 3.2.0'
gem 'simple_form', '~> 2.0.4'
gem 'inherited_resources', '~> 1.3.1'
gem 'rabl', '~> 0.7.9'
gem 'enumerize', '~> 0.5.1'
gem 'mail_form', '~> 1.4.1'
gem 'paper_trail', '~> 2.7.2'
gem 'coveralls', '~> 0.6.9', require: false

group :assets do
  gem 'uglifier', '~> 1.3.0'
  gem 'compass-rails', '~> 1.0.3'
  gem 'zurb-foundation', '~> 3.2.5'
  gem 'sass-rails', '~> 3.2.6'
  gem 'backbone-on-rails', '~> 1.0'
  gem 'marionette-rails', '~> 1.0.4'
  gem 'jquery-rails', '~> 2.1.4'
  gem 'haml', '~> 3.1.7'
  gem 'select2-rails', '~> 3.4.8'
  gem 'spinjs-rails', '~> 1.3.0'
end

group :development, :test do
  gem 'dotenv', '~> 0.7.0'
  gem 'sqlite3', '~> 1.3.8'
  gem 'pry-rails', '~> 0.2.2'
  gem 'jasmine-rails', '~> 0.4.5'
  gem 'jasmine', '1.3.0'
  gem 'foreman', '~> 0.60.2'
  gem 'rspec-rails', '~> 2.13'
  gem 'factory_girl_rails', '~> 4.1.0'
end

group :development do
  # Required to run rake db:migrate on Ubuntu. Provides a JavaScript runtime.
  gem 'therubyracer', '~> 0.10.2', require: 'v8'
  gem 'rb-readline', '~> 0.4.2'
  gem 'quiet_assets', '~> 1.0.1'
  gem 'haml-rails', '~> 0.3.5'
  gem 'hpricot', '~> 0.8.6'
  gem 'ruby_parser', '~> 3.1.1'
  gem 'rb-inotify', '~> 0.9.0', :require => false # Linux
  gem 'rb-fsevent', '~> 0.9.3', :require => false # OSX
  gem 'terminal-notifier-guard', '~> 1.5.3', :require => false
  gem "guard-rails", ">= 0.4.0"
  gem 'guard-bundler', '~> 1.0.0'
  gem 'guard-rspec', '~> 3.1.0'
  # gem 'guard-jasmine-headless-webkit', '~> 0.3.2'
  gem 'rb-fsevent', '~> 0.9.3', :require => false if RUBY_PLATFORM =~ /darwin/i
  gem 'guard-livereload', '~> 1.4.0'
  gem 'guard-zeus', '~> 0.0.1'
  gem 'rack-livereload', '~> 0.3.15'
  gem 'fuubar', '~> 1.2.0'
  gem 'better_errors', '~> 0.9.0'
  gem 'binding_of_caller', '~> 0.7.2'
  gem 'meta_request', '~> 0.2.8'
end

group :test do
  gem 'database_cleaner', '~> 0.9.1'
  gem 'email_spec', '~> 1.4.0'
  gem 'launchy', '~> 2.1.2'
  gem 'capybara', '~> 2.1.0'
  gem 'fakeweb', '~> 1.3.0'
  gem 'rack-test', '~> 0.6.2', require: 'rack/test'
end

group :production do
  gem 'pg', '~> 0.14.1'
end

