source 'https://rubygems.org'
gem 'rails', '3.2.9'
gem 'sqlite3'
group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'
  gem 'uglifier', '>= 1.0.3'
end
gem 'jquery-rails'
gem "thin", ">= 1.5.0"
gem "haml", ">= 3.1.7"
gem "haml-rails", ">= 0.3.5", :group => :development
gem "hpricot", ">= 0.8.6", :group => :development
gem "ruby_parser", ">= 3.0.1", :group => :development
gem "rspec-rails", ">= 2.11.4", :group => [:development, :test]
gem "database_cleaner", ">= 0.9.1", :group => :test
gem "email_spec", ">= 1.4.0", :group => :test
gem "launchy", ">= 2.1.2", :group => :test
gem "capybara", ">= 1.1.3", :group => :test
gem "factory_girl_rails", ">= 4.1.0", :group => [:development, :test]
gem "devise", ">= 2.1.2"
gem "cancan", ">= 1.6.8"
gem "rolify", ">= 3.2.0"
gem "simple_form", ">= 2.0.4"
gem "quiet_assets", ">= 1.0.1", :group => :development
gem "dotenv", :group => [:development, :test]

# Required to run rake db:migrate on Ubuntu. Provides a JavaScript runtime.
gem "therubyracer", require: "v8"

group :development do
 gem 'rb-inotify', :require => false # Linux
 gem 'rb-fsevent', :require => false # OSX
 gem 'terminal-notifier-guard', :require => false
 gem 'guard-bundler'
 gem 'guard-spork'
 gem 'spork', ">=1.0.0rc3"
 gem 'guard-rspec'
end
