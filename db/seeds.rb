# encoding: UTF-8

if User.exists?(email: ENV["DEFAULT_ADMIN_EMAIL"])
  puts "Super Admin #{ENV['DEFAULT_ADMIN_EMAIL']} has already been created."
else
  superadmin = User.new name: 'Default Superadmin',
    email: ENV["DEFAULT_ADMIN_EMAIL"].dup,
    password: ENV["DEFAULT_ADMIN_PASSWORD"].dup,
    password_confirmation: ENV["DEFAULT_ADMIN_PASSWORD"].dup
  superadmin.remove_role :user
  superadmin.add_role :superadmin
  superadmin.save!
  puts "New user created: #{superadmin.name}"
end

