source 'https://rubygems.org'

gem 'rails', git: 'git://github.com/rails/rails.git', branch: '4-1-stable'

# temporary addition for migration to rails 4
gem 'protected_attributes'
gem 'sprockets-rails', :require => 'sprockets/railtie'

gem 'activeadmin', github: 'activeadmin'
gem 'geocoder'
gem 'thin'
gem 'devise'
gem 'devise-i18n-views', '~> 0.2.8'
gem 'cancan'
gem 'nominatim', git: 'https://github.com/cnrk/nominatim.git', branch: 'feature/add-structured-query-support'
gem 'rolify'
gem 'simple_form', github: 'plataformatec/simple_form'
gem 'inherited_resources'
gem 'rabl'
gem 'enumerize'
gem 'paper_trail'
gem 'dotenv'
gem 'uberspacify'
gem 'capistrano', '~> 2'
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

group :assets do
  gem 'uglifier'

  gem 'sass-rails', git: "https://github.com/rails/sass-rails.git", branch: '4-0-stable'
  gem 'haml-rails'

  gem 'backbone-on-rails'
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
end

group :test do
  gem 'database_cleaner'
  gem 'email_spec'
  gem 'launchy'
  gem 'capybara'
  gem 'fakeweb'
  gem 'rack-test', require: 'rack/test'
end

group :production do
  gem 'mysql2'
end

