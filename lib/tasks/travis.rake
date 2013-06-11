# encoding: UTF-8

namespace :travis do
  desc <<-DESC
    Script for running RSpec test on Travis.
  DESC

  task :specs do
    ["rspec spec"].each do |cmd|
      puts "Starting to run #{cmd}..."
      system("export DISPLAY=:99.0 && bundle exec #{cmd}")
      raise "#{cmd} failed!" unless $?.exitstatus == 0
    end
  end

end

