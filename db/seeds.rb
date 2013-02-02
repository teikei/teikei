puts 'DELETE ALL EXISTING DEPOTS AND FARMS'
# this will cascade to farms and depots
Place.delete_all
puts 'DELETE ALL EXISTING USERS'
User.delete_all

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
farm1 = Farm.create! name: 'Gutshof', location: 'Fehrbelliner Str. 45a, 16816 Neuruppin'
farm1.user = user1
farm1.save!
puts 'New farm created: ' << farm1.name
farm2 = Farm.create! name: 'Solidarischer Garten', location: 'Otawistr. 46, 13351 Berlin'
farm2.user = user2
farm2.save!
puts 'New farm created: ' << farm2.name
farm3 = Farm.create! name: 'Bioschweinemast Neukoelln', location: 'Karl-Marx-Str. 66, 12043 Berlin'
puts 'New farm created: ' << farm3.name

puts 'SETTING UP SOME DEPOTS'
depot1 = Depot.create! name: 'Neukoelln Standort 1', location: 'Richardplatz Berlin'
depot1.user = user1
depot1.save!
puts 'New depot created: ' << depot1.name
depot2 = Depot.create! name: 'Gaumenfreunde Wedding', location: 'Malplaquetstr. 10 13477 Berlin'
depot2.user = user2
depot2.save!
puts 'New depot created: ' << depot2.name
depot3 = Depot.create! name: 'Gaumenfreunde Prenzlauer Berg', location: 'Schivelbeiner Str. 6, 10439 Berlin'
puts 'New farm created: ' << depot3.name
