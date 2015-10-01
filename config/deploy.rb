lock '3.4.0'

set :application, 'teikei'
set :repo_url, 'git@github.com:teikei/teikei.git'
set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml', '.env')
set :rails_env, 'production'

Airbrussh.configure do |config|
  config.banner = 'Teikei Deployment'
end

task :npm do
  on roles(:app) do
    within release_path do
      execute fetch(:npm_executable, 'npm'), 'install'
    end
  end
end

task :gulp do
  on roles(:app) do
    within release_path do
      execute fetch(:gulp_executable, 'gulp'), 'webpack-production-build'
    end
  end
end

before 'deploy:updated', 'npm'
before 'deploy:updated', 'gulp'
