source 'https://rubygems.org'

gem 'rails', '~> 4'

# temporary addition for migration to rails 4
gem 'protected_attributes'
gem 'sprockets-rails', require: 'sprockets/railtie'

gem 'activeadmin', git: 'https://github.com/activeadmin/activeadmin.git'
gem 'activeadmin_pagedown'
gem 'geocoder'
gem 'thin'
gem 'devise'
gem 'devise-i18n'
gem 'devise-i18n-views'
gem 'cancan'
gem 'nominatim'
gem 'rolify'
gem 'inherited_resources'
gem 'jbuilder'
gem 'oj'
gem 'oj_mimic_json'
gem 'enumerize'
gem 'paper_trail'
gem 'dotenv-rails', require: 'dotenv/rails-now'
gem 'exception_notification'
gem 'carrierwave'
gem 'mini_magick'
gem 'redcarpet'
gem 'autoprefixer-rails'
gem 'i18n-js'
gem 'haml'
gem 'compass-rails'
gem 'susy', '~> 1'
gem 'jquery-fileupload-rails'
gem 'non-stupid-digest-assets'
gem 'mysql2', '~> 0.3.18'

group :assets do
  gem 'uglifier'

  gem 'sass-rails'
  gem 'haml-rails'

  gem 'ejs'
  gem 'coffee-script'

end

group :development, :test do
  gem 'sqlite3'
  gem 'pry-rails'
  gem 'byebug'
  gem 'foreman'
  gem 'rspec-rails'
  gem 'factory_girl_rails'
  gem 'letter_opener'
  gem 'betterlorem'
  gem 'spring'
end

group :development do
  gem 'quiet_assets'
  gem 'hpricot'
  gem 'ruby_parser'
  gem 'rack-livereload'
  gem 'fuubar'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'meta_request'
  gem 'capistrano', '~> 3.4.0'
  gem 'capistrano-uberspace'
  gem 'airbrussh', require: false
end

group :test do
  gem 'database_cleaner'
  gem 'email_spec'
  gem 'launchy'
  gem 'capybara'
  gem 'fakeweb'
  gem 'rack-test', require: 'rack/test'
  gem 'coveralls', require: false
end

group :production do
  gem 'dalli'
  gem 'newrelic_rpm'
  gem 'passenger'
end

