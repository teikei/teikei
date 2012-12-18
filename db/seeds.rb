puts 'CREATING ROLES'
Role.create([
  { :name => 'admin' },
  { :name => 'user' }
], :without_protection => true)
puts 'SETTING UP DEFAULT USER LOGIN'
user = User.create! :name => 'Default User', :email => 'user@example.com', :password => 'password', :password_confirmation => 'password'
puts 'New user created: ' << user.name
user2 = User.create! :name => 'Default Admin', :email => 'admin@example.com', :password => 'password', :password_confirmation => 'password'
puts 'New user created: ' << user2.name
user.add_role :user
user2.add_role :admin
