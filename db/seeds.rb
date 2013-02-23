# encoding: UTF-8

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
farm1 = Farm.create! name: 'Gutshof',
city: 'Neuruppin',
address: 'Fehrbelliner Str. 45a',
description: 'Der Gutshof ist eine Farm',
contact_name: 'Bärbel Funke',
contact_email: 'baerbel.funke@gutshof.de',
contact_phone: '03391-12345678',
founded_at: Date.today - rand(10).years,
maximum_members: 8,
products: 'Weißkohl, Kartoffeln, Karotten',
farming_standard: 'extrem ökologisch',
participation: 'Beim Pflanzen im Frühling brauchen wir Hilfe.'

farm1.user = user1
farm1.save!
puts 'New farm created: ' << farm1.name
farm2 = Farm.create! name: 'Solidarischer Garten',
city: 'Berlin',
address: 'Otawistr. 46',
description: 'Der Solidarische Garten ist eine Farm',
contact_name: 'Fritz Meyer',
contact_email: 'fritz.meyer@solidarischer-garten.de',
contact_phone: '030-12345678',
founded_at: Date.today - rand(10).years,
maximum_members: 10,
products: 'Kaffee, Milch, Karotten',
farming_standard: 'voll ökologisch',
participation: 'Garten umgraben ist angesagt'
farm2.user = user2
farm2.save!
puts 'New farm created: ' << farm2.name

farm3 = Farm.create! name: 'Bioschweinemast Neukoelln',
city: 'Berlin',
address: 'Karl-Marx-Str. 66',
description: 'Die Bioschweinemast Neukoelln ist eine Farm',
contact_name: 'Johanna Zobbauer',
contact_email: 'johanna.zobbauer@bioschweinemast-neukoelln.de',
contact_phone: '030-44400055',
founded_at: Date.today - rand(10).years,
maximum_members: 25,
products: 'Leberwurst, Räucherwurst, Schnitzel',
farming_standard: 'biologisch wertvoll',
participation: 'Schweine streicheln und ausmisten'
puts 'New farm created: ' << farm3.name

puts 'SETTING UP SOME DEPOTS'
depot1 = Depot.create! name: 'Neukoelln Standort 1',
city: 'Berlin',
address: 'Richardplatz',
description: 'Der Neukoelln Standort 1 ist ein Depot',
contact_name: 'Bernd Wilde',
contact_email: 'bernd.wilde@web.de',
contact_phone: '030-77771111'
depot1.user = user1
depot1.save!
puts 'New depot created: ' << depot1.name

depot2 = Depot.create! name: 'Gaumenfreunde Wedding',
city: 'Berlin',
address: 'Malplaquetstr. 10',
description: 'Die Gaumenfreunde Wedding sind ein Depot',
contact_name: 'Mattias Frank',
contact_email: 'matthias.frank@gmxpro.de',
contact_phone: '030-88882222'
depot2.user = user2
depot2.save!
puts 'New depot created: ' << depot2.name

depot3 = Depot.create! name: 'Gaumenfreunde Prenzlauer Berg',
city: 'Berlin',
address: 'Schivelbeiner Str. 6',
description: 'Die Gaumenfreunde Prenzlauer Berg sind ein Depot',
contact_name: 'Kristina Nguyen',
contact_email: 'kristina.nguyengooglemail.de',
contact_phone: '030-66663333'
puts 'New farm created: ' << depot3.name
