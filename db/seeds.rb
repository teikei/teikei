puts 'SETTING UP DEFAULT USER LOGIN'
user1 = User.create! name: 'First User',
  email: 'first.user@example.com',
  password: 'password',
  password_confirmation: 'password'
puts "New user created: #{user1.name}"
# Default :user role is applied in User model.

user2 = User.create! name: 'Second User',
  email: 'second.user@example.com',
  password: 'password',
  password_confirmation: 'password'
puts "New user created: #{user2.name}"
# Default :user role is applied in User model.

admin = User.create! :name => 'Default Admin',
  :email => 'admin@example.com',
  :password => 'password',
  :password_confirmation => 'password'
admin.remove_role :user
admin.add_role :admin
admin.save!
puts "New user created: #{admin.name}"

superadmin = User.create! name: 'Default Superadmin',
  email: ENV["DEFAULT_ADMIN_EMAIL"].dup,
  password: ENV["DEFAULT_ADMIN_PASSWORD"].dup,
  password_confirmation: ENV["DEFAULT_ADMIN_PASSWORD"].dup
superadmin.remove_role :user
superadmin.add_role :superadmin
superadmin.save!
puts "New user created: #{superadmin.name}"




puts 'SETTING UP SOME FARMS'
farm1 = Farm.create! name: 'User1 farm', location: 'Mexico'
farm1.user = user1
farm1.save!
puts 'New farm created: ' << farm1.name
farm2 = Farm.create! name: 'User2 farm', location: 'Bolivia'
farm2.user = user2
farm2.save!
puts 'New farm created: ' << farm2.name
farm3 = Farm.create! name: 'Nobody\'s farm', location: 'Death Valley'
puts 'New farm created: ' << farm3.name
