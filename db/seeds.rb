puts 'SETTING UP DEFAULT USER LOGIN'
user = User.create! :name => 'Default User',
  :email => 'user@example.com',
  :password => 'password',
  :password_confirmation => 'password'
user.add_role :user
puts "New user created: #{user.name}"

admin = User.create! :name => 'Default Admin',
  :email => 'admin@example.com',
  :password => 'password',
  :password_confirmation => 'password'
admin.remove_role :user
admin.add_role :admin
puts "New user created: #{admin.name}"

superadmin = User.create! :name => 'Default Superadmin',
  :email => ENV["DEFAULT_ADMIN_EMAIL"].dup,
  :password => ENV["DEFAULT_ADMIN_PASSWORD"].dup,
  :password_confirmation => ENV["DEFAULT_ADMIN_PASSWORD"].dup
superadmin.remove_role :user
superadmin.add_role :superadmin
puts "New user created: #{superadmin.name}"
