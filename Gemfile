source 'https://rubygems.org'
gem 'rails', '~> 3.2.12'
gem 'sqlite3', '~> 1.3.7'
gem 'activeadmin', '~> 0.5.1'
gem 'meta_search', '~> 1.1.0.pre'
gem 'sass-rails', '~> 3.2.6'
gem 'geocoder', '~> 1.1.6'

group :assets do
  gem 'uglifier', '~> 1.3.0'
  gem 'compass-rails', '~> 1.0.3'
  gem 'zurb-foundation', '~> 3.2.5'
  # use beta version because Marionette.Controllers are not implemented in the released version
  gem 'marionette-rails', '~> 1.0.0beta5', git: 'git://github.com/rahilsondhi/marionette-rails.git'
end

gem 'jquery-rails', '~> 2.1.4'
gem 'thin', '~> 1.5.0'
gem 'haml', '~> 3.1.7'
gem 'haml-rails', '~> 0.3.5', :group => :development
gem 'hpricot', '~> 0.8.6', :group => :development
gem 'ruby_parser', '~> 3.1.1', :group => :development
gem 'rspec-rails', '~> 2.12.2', :group => [:development, :test]
gem 'database_cleaner', '~> 0.9.1', :group => :test
gem 'email_spec', '~> 1.4.0', :group => :test
gem 'launchy', '~> 2.1.2', :group => :test
gem 'capybara', '~> 2.0.2', :group => :test
gem 'factory_girl_rails', '~> 4.1.0', :group => [:development, :test]
gem 'devise', '~> 2.2.2'
gem 'devise-i18n-views', '~> 0.2.5'
gem 'cancan', '~> 1.6.8'
gem 'rolify', '~> 3.2.0'
gem 'simple_form', '~> 2.0.4'
gem 'quiet_assets', '~> 1.0.1', :group => :development
gem 'dotenv', '~> 0.4.0', :group => [:development, :test]
gem 'backbone-on-rails', '~> 0.9.2.3', :group => :development
gem 'inherited_resources', '~> 1.3.1'
gem 'rabl', '~> 0.7.9'

# Required to run rake db:migrate on Ubuntu. Provides a JavaScript runtime.
gem 'therubyracer', '~> 0.10.2', require: 'v8'
gem 'rb-readline', '~> 0.4.2'

group :development, :test do
  gem 'jasmine-rails', '~> 0.3.2'
  gem 'foreman', '~> 0.60.2'
end

group :development do
  gem 'rb-inotify', '~> 0.9.0', :require => false # Linux
  gem 'rb-fsevent', '~> 0.9.3', :require => false # OSX
  gem 'terminal-notifier-guard', '~> 1.5.3', :require => false
  gem 'guard-bundler', '~> 1.0.0'
  gem 'guard-spork', '~> 1.4.1'
  gem 'spork', '~>1.0.0rc3'
  gem 'guard-rspec', '~> 2.3.3'
  gem 'guard-jasmine-headless-webkit', '~> 0.3.2'
  gem 'rack-livereload', '~> 0.3.11'
  gem 'guard-livereload', '~> 1.1.3'
  gem 'fuubar', '~> 1.1.0'
end

group :test do
  gem 'fakeweb', '~> 1.3.0'
  gem 'rack-test', '~> 0.6.2', require: 'rack/test'
end
