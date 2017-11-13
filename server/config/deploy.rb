set :application, 'teikei'
set :repo_url, 'git@github.com:teikei/teikei.git'
set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml', '.env')
set :rails_env, 'production'

Airbrussh.configure do |config|
  config.banner = 'Teikei Deployment'
  config.command_output = true
end

task :build_client do
  on roles(:app) do
    within release_path do
      execute *%w[ ./teikei.sh deploy_client ]
    end
  end
end

namespace :uploads do
  task :mv_rails_app_dir
  on roles(:app) do
    run "mv #{release_path}/server/* #{release_path}/ "
  end
end

before 'deploy:symlink:linked_files', 'uploads:mv_rails_app_dir'
before 'deploy:updated', 'build_client'
