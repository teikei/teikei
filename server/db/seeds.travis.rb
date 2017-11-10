# encoding: UTF-8

if User.exists?(email: 'mail@example.com')
  puts "Super Admin 'mail@example.com' has already been created."
else
  superadmin = User.new name: 'Default Superadmin',
    email: 'mail@example.com',
    password: 'passw0rd',
    password_confirmation: 'passw0rd'
  superadmin.remove_role :user
  superadmin.add_role :superadmin
  superadmin.skip_confirmation!
  superadmin.save!
  puts "New user created: #{superadmin.name}"
end

