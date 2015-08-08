lock '3.4.0'

set :application, 'teikei'

set :repo_url, 'git@github.com:teikei/teikei.git'

set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml', '.env')

set :bower_bin, '~/bin/bower'

set :rails_env, 'production'

Airbrussh.configure do |config|
  config.banner = "Teikei Deployment"
end

