set :application, 'teikei'
set :repo_url, 'git@github.com:teikei/teikei.git'
set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml', '.env')
set :rails_env, 'production'
set :keep_releases, 2

Airbrussh.configure do |config|
  config.banner = 'Teikei Deployment'
  config.command_output = true
end

task :deploy_client do
  on roles(:app) do
    within release_path do
      execute *%w[ ./teikei.sh deploy_client ]
    end
  end
end

namespace :deploy do
  namespace :symlink do
    Rake::Task['linked_files'].clear_actions
    task :linked_files do
      next unless any? :linked_files
      on release_roles :all do
        # move files to root before installing
        execute "mv", "#{fetch(:release_path)}/server/*", "#{fetch(:release_path)}/"
        execute :mkdir, "-p", linked_file_dirs(release_path)

        fetch(:linked_files).each do |file|
          target = release_path.join(file)
          source = shared_path.join(file)
          next if test "[ -L #{target} ]"
          execute :rm, target if test "[ -f #{target} ]"
          execute :ln, "-s", source, target
        end
      end
    end
  end
end

before 'deploy:updated', 'deploy_client'
