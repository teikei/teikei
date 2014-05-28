source 'https://rubygems.org'

gem 'rails', '~> 3.2.16'
gem 'activeadmin', '~> 0.6.2'
gem 'geocoder', '~> 1.1.9'
gem 'thin', '~> 1.6.1'
gem 'devise', '~> 2.2.8'
gem 'devise-i18n-views', '~> 0.2.8'
gem 'cancan', '~> 1.6.10'
gem 'nominatim', git: 'https://github.com/cnrk/nominatim.git', branch: 'feature/add-structured-query-support'
gem 'rolify', '~> 3.4.0'
gem 'simple_form', '~> 2.1.1'
gem 'inherited_resources', '~> 1.4.1'
gem 'rabl', '~> 0.9.3'
gem 'enumerize', '~> 0.8.0'
gem 'paper_trail', '~> 3.0.0'
gem 'coveralls', '~> 0.7.0', require: false
gem 'dotenv', '~> 0.10.0'
gem 'uberspacify', git: 'git://github.com/johnjohndoe/uberspacify.git', branch: 'feature/status-information'
gem 'capistrano', '~> 2.15.5'
gem 'haml-rails', '~> 0.4'
gem 'exception_notification', '~> 4.0.1'
gem 'carrierwave', '~> 0.9.0'
gem 'mini_magick', '~> 3.5.0'
gem 'redcarpet'
gem 'ejs'
gem 'coffee-script', '~> 2.2.0'

group :assets do
  gem 'uglifier', '~> 2.5.0'
  gem 'compass-rails', '~> 1.1.2'
  gem 'zurb-foundation', '~> 3.2.5'
  gem 'sass-rails', '~> 3.2.6'
  gem 'haml', '~> 4.0.4'
  gem 'jquery-fileupload-rails', '~> 0.4.1'
end

group :development, :test do
  gem 'sqlite3', '~> 1.3.8'
  gem 'pry-rails', '~> 0.3.2'
  gem 'byebug', '~> 2.7.0'
  gem 'jasmine-rails', '~> 0.5.1'
  gem 'jasmine', '1.3.0'
  gem 'foreman', '~> 0.63.0'
  gem 'rspec-rails', '~> 2.13'
  gem 'factory_girl_rails', '~> 4.4.1'
  gem 'letter_opener'
  gem 'betterlorem'
end

group :development do
  # Required to run rake db:migrate on Ubuntu. Provides a JavaScript runtime.
  gem 'therubyracer', '~> 0.12.0', require: 'v8'
  gem 'quiet_assets', '~> 1.0.2'
  gem 'hpricot', '~> 0.8.6'
  gem 'ruby_parser', '~> 3.5.0'
  gem 'rb-inotify', '~> 0.9.0', :require => false # Linux
  gem 'terminal-notifier-guard', '~> 1.5.3', :require => false
  gem "guard-rails", ">= 0.4.0"
  gem 'guard-bundler', '~> 2.0.0'
  gem 'guard-rspec', '~> 4.2.0'
  gem 'guard-livereload', '~> 2.1.0'
  gem 'guard-zeus', '~> 2.0.0'
  gem 'rack-livereload', '~> 0.3.15'
  gem 'fuubar', '~> 1.3.2'
  gem 'better_errors', '~> 1.1.0'
  gem 'binding_of_caller', '~> 0.7.2'
  gem 'meta_request', '~> 0.2.8'
end

group :test do
  gem 'database_cleaner', '~> 1.2.0'
  gem 'email_spec', '~> 1.5.0'
  gem 'launchy', '~> 2.4.2'
  gem 'capybara', '~> 2.2.0'
  gem 'fakeweb', '~> 1.3.0'
  gem 'rack-test', '~> 0.6.2', require: 'rack/test'
end

group :production do
  gem 'mysql2', '~> 0.3.14'
end

