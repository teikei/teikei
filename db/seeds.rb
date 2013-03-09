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
farm1 = Farm.create! name: 'Gutshof Neuruppin',
city: 'Neuruppin',
address: 'Fehrbelliner Str. 45a',
description: 'Der Gutshof ist eine Farm',
contact_name: 'Bärbel Funke',
contact_email: 'baerbel.funke@gutshof.de',
contact_phone: '03391-12345678',
founded_at: Date.today - rand(10).years,
maximum_members: 60,
products: 'Gemüse, Obst, Eier, Tee',
farming_standard: 'biologisch',
participation: 'Du solltest bereit sein, mindestens vier mal im Jahr bei uns mitzuhelfen.'

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
products: 'Gemüse, Teigwaren, Fleisch, Eier, Sonstiges',
farming_standard: 'biodynamisch',
participation: 'Garten umgraben ist angesagt'
farm2.user = user2
farm2.save!
puts 'New farm created: ' << farm2.name

farm3 = Farm.create! name: 'Fröhliche Gärtnerei',
city: 'Grünheide',
address: 'Kienbaumer Weg',
description: 'Unsere Gemüse-Versorger-Gemeinschaft startet am 1. März 2013 ihr zweites Wirtschaftsjahr und ist offen für neue ErnteanteilhaberInnen.
',
contact_name: 'Johanna Zobbauer',
contact_email: 'johanna.zobbauer@froehlichegaertnerei.de',
contact_phone: '030-44400055',
founded_at: Date.today - rand(10).years,
maximum_members: 25,
products: 'Gemüse, Obst',
farming_standard: 'biologisch',
participation: 'Du solltest bereit sein, mindestens drei mal im Jahr in der Gärtnerei mitzuhelfen. Besondere Kenntnisse sind nicht notwendig.'
farm3.user = user2
farm3.save!
puts 'New farm created: ' << farm3.name

puts 'SETTING UP SOME DEPOTS'
depot1 = Depot.create! name: 'Fröhliche Gärtnerei, Standort Neukölln 1',
city: 'Berlin',
address: 'Richardplatz',
description: 'Der Neukoelln Standort 1 ist ein Depot',
contact_name: 'Bernd Fröhliche',
contact_email: 'bernd.froehliche@web.de',
contact_phone: '030-77771111'
depot1.user = user1
depot1.save!
puts 'New depot created: ' << depot1.name

depot2 = Depot.create! name: 'Gemüsefreunde Wedding',
city: 'Berlin',
address: 'Malplaquetstr. 10',
description: 'Wir sind eine Gruppe von Menschen aus dem Wedding, die mit dem Gutshof Neuruppin solidarische Landwirtschaft betreiben',
contact_name: 'Mattias Frank',
contact_email: 'matthias.frank@gmxpro.de',
contact_phone: '030-88882222'
depot2.user = user2
depot2.save!
puts 'New depot created: ' << depot2.name

depot3 = Depot.create! name: 'Gemüsefreunde Prenzlauer Berg',
city: 'Berlin',
address: 'Schivelbeiner Str. 6',
description: 'Wir sind eine Gruppe von Menschen aus dem Prenzlberg, die mit dem Gutshof Neuruppin solidarische Landwirtschaft betreiben',
contact_name: 'Kristina Nguyen',
contact_email: 'kristina.nguyen@googlemail.de',
contact_phone: '030-66663333'
puts 'New depot created: ' << depot3.name

depot4 = Depot.create! name: 'Fröhliche Gärtnerei, Standort Neukölln 2',
city: 'Berlin',
address: 'Hermannplatz',
description: 'Einige unserer Mitglieder sind mit einem Stand auf dem Fair Camp 2013 am Samstag, 19.1. vertreten. Wer sich für eine Mitgliedschaft (besonders in Pankow) interessiert, kann gerne ins Gespräch kommen! Fair Camp am 19.1. ab 10.00 Uhr',
contact_name: 'Bernd Fröhliche',
contact_email: 'bernd.froehliche@web.de',
contact_phone: '030-77771111'
depot4.user = user1
depot4.save!
puts 'New depot created: ' << depot4.name

depot5 = Depot.create! name: 'Fröhliche Gärtnerei, Standort Schöneberg',
city: '10825 Berlin',
address: 'Badensche Straße 52',
description: 'Der Neukoelln Standort 1 ist ein Depot der Fröhlichen Gärtnerei!',
contact_name: 'Bernd Fröhliche',
contact_email: 'bernd.froehliche@web.de',
contact_phone: '030-77771111'
depot5.user = user1
depot5.save!
puts 'New depot created: ' << depot5.name

depot6 = Depot.create! name: 'Fröhliche Gärtnerei, Standort Kreuzberg',
city: 'Berlin',
address: 'Kottbusser Tor',
description: 'Einige unserer Mitglieder sind mit einem Stand auf dem Fair Camp 2013 am Samstag, 19.1. vertreten. Wer sich für eine Mitgliedschaft (besonders in Pankow) interessiert, kann gerne ins Gespräch kommen! Fair Camp am 19.1. ab 10.00 Uhr',
contact_name: 'Bernd Fröhliche',
contact_email: 'bernd.froehliche@web.de',
contact_phone: '030-77771111'
depot6.user = user1
depot6.save!
puts 'New depot created: ' << depot6.name

farm1.places << depot2
farm1.places << depot3
farm1.places << farm2

farm2.places << depot2
farm2.places << depot3

farm3.places << depot1
farm3.places << depot4
farm3.places << depot5
farm3.places << depot6
