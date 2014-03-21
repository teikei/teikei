# encoding: UTF-8

namespace :db do
  namespace :seed do

    def geocode(place)
      result = Geocoder.search(place.location)[0]
      throw "Geocoder returned nil for '#{place.location}'." if result.nil?
      place.latitude = result.latitude
      place.longitude = result.longitude
    end

    desc "Erases all users and places, then loads seed data from db/seeds.rb. Finally generates fresh test data."
    task :all => [:environment] do
      Rake::Task['db:seed:erase'].invoke
      Rake::Task['db:seed'].invoke
      Rake::Task['db:seed:generate'].invoke
    end

    desc "Erases test data (places and users)."
    task :erase => [:environment] do
      puts 'DELETE ALL EXISTING DEPOTS AND FARMS'
      Place.delete_all
      puts 'DELETE ALL EXISTING USERS'
      User.delete_all
    end

    desc "Generates test data (places and users)."
    task :generate => [:environment] do

      puts 'SETTING UP DEFAULT USER LOGIN'
      user1 = User.new name: 'Bärbel Hartmann - Benutzer Eins',
        email: 'benutzer1@ernte-teilen.de',
        phone: '03391-12345678',
        password: 'passwort',
        password_confirmation: 'passwort'
      puts "New user created: #{user1.name}"
      user1.skip_confirmation!

      user2 = User.new name: 'Werner Funke - Benutzer Zwei',
        email: 'benutzer2@ernte-teilen.de',
        phone: '033394-12345678',
        password: 'passwort',
        password_confirmation: 'passwort'
      puts "New user created: #{user2.name}"
      user2.skip_confirmation!

      user3 = User.new name: 'Johanna Zobbauer - Benutzer Drei',
        email: 'benutzer3@ernte-teilen.de',
        phone: '03362-44400055',
        password: 'passwort',
        password_confirmation: 'passwort'
      puts "New user created: #{user3.name}"
      user3.skip_confirmation!

      user4 = User.new name: 'Irma Maislinger - Benutzer Vier',
        email: 'benutzer4@ernte-teilen.de',
        phone: '033204-55510500',
        password: 'passwort',
        password_confirmation: 'passwort'
      puts "New user created: #{user4.name}"
      user4.skip_confirmation!

      admin = User.new :name => 'Default Admin',
        :email => 'admin@example.com',
        :password => 'password',
        :password_confirmation => 'password'
      admin.remove_role :user
      admin.add_role :admin
      admin.skip_confirmation!
      admin.save!
      puts "New user created: #{admin.name}"

      puts 'SETTING UP SOME FARMS'

      founded_at =  Date.today - rand(10).years
      farm1 = Farm.new name: 'Gutshof Neuruppin',
        city: 'Neuruppin',
        address: 'Fehrbelliner Str. 45a',
        description: 'Seit jeher ist Neuruppin für seine hervorragenden Kartoffeln bekannt. Natürlich gibt es auch anderes Wurzelgemüse bei uns.',
        url: 'http://www.baerbelfunke.com',
        contact_function: 'Traktorfahrerin',
        founded_at_year: founded_at.year,
        founded_at_month: founded_at.month,
        maximum_members: 60,
        vegetable_products: %w{vegetables fruits bread_and_pastries},
        animal_products: %w{sausages milk eggs},
        beverages: %w{beer},
        additional_product_information: 'Unsere Brauerei besteht seit mehr als 130 Jahren',
        acts_ecological: true,
        economical_behavior: "Alles wird biologisch angebaut.",
        participation: 'Du solltest bereit sein, mindestens vier mal im Jahr bei uns mitzuhelfen.'
      farm1.users = [user1]
      geocode(farm1)
      farm1.save!
      puts 'New farm created: ' << farm1.name

      founded_at =  Date.today - rand(10).years
      farm2 = Farm.new name: 'Hof Blumberg',
        city: 'Blumberg',
        address: 'Friedensweg 11',
        description: 'Der Hof Blumberg ist ein Familienbetrieb nordöstlich von Berlin.',
        url: 'http://www.hof-blumberg.de',
        contact_function: 'Landwirt',
        founded_at_year: founded_at.year,
        founded_at_month: founded_at.month,
        maximum_members: 10,
        vegetable_products: %w{spices mushrooms bread_and_pastries},
        animal_products: %w{dairy milk fish},
        beverages: %w{wine},
        additional_product_information: 'Wir sind berühmt für unsere Weißweine',
        acts_ecological: true,
        economical_behavior: "Alles wird bio-dynamisch angebaut.",
        participation: 'Wir benötigen gerade im Sommer immer wieder Hilfe beim Wässern, weil unsere Mitarbeiter im Urlaub sind.'
      farm2.users = [user2]
      geocode(farm2)
      farm2.save!
      puts 'New farm created: ' << farm2.name

      founded_at =  Date.today - rand(10).years
      farm3 = Farm.new name: 'Fröhliche Gärtnerei',
        city: 'Grünheide',
        address: 'Kienbaumer Weg',
        description: 'Unsere Gemüse-Versorger-Gemeinschaft startet am 1. März ihr Wirtschaftsjahr und ist offen für neue ErnteanteilhaberInnen.',
        contact_function: 'Gemüseexpertin',
        founded_at_year: founded_at.year,
        founded_at_month: founded_at.month,
        maximum_members: 25,
        vegetable_products: %w{vegetables mushrooms bread_and_pastries cereals},
        animal_products: %w{},
        beverages: %w{juice},
        additional_product_information: 'Bei uns gibt es das beste frische Brot weit und breit.',
        acts_ecological: true,
        economical_behavior: "Wir arbeiten mit Permakulturen.",
        participation: 'Du solltest bereit sein, mindestens drei mal im Jahr in der Gärtnerei mitzuhelfen. Besondere Kenntnisse sind nicht notwendig.'
      farm3.users = [user2]
      geocode(farm3)
      farm3.save!
      puts 'New farm created: ' << farm3.name

      founded_at =  Date.today - rand(10).years
      farm4 = Farm.new name: 'Hof Reesdorf',
        city: 'Reesdorf',
        address: 'Kaniner Strasse 4',
        description: 'Wir pflanzen hauptsächlich alte Sorten an und versuchen diese weiterhin zu kultivieren. Natürlich kann man bei uns auch Spargel ernten.',
        contact_function: 'Hofbesitzerin',
        founded_at_year: founded_at.year,
        founded_at_month: founded_at.month,
        maximum_members: 22,
        vegetable_products: nil,
        animal_products: %w{dairy milk meat fish honey},
        beverages: %w{juice wine},
        additional_product_information: 'Eine reiche Auswahl an Obst und Gemüse.',
        acts_ecological: true,
        economical_behavior: "Wir folgen der konventionellen Landwirtschaft.",
        participation: 'Bei der Spargelernte fehlen uns jedes Jahr tatkräftige Hände.'
      farm4.users = [user3]
      geocode(farm4)
      farm4.save!
      puts 'New farm created: ' << farm4.name

      founded_at =  Date.today - rand(10).years
      farm5 = Farm.new name: 'Fischerei Böhnke',
        city: 'Teupitz',
        address: 'Gutzmannstrasse 51',
        description: 'Bei uns gibt es frischen und geräucherten Fisch aus dem Teupitzer und Schweriner See.',
        contact_function: 'Pächterin, Fischerin',
        founded_at_year: founded_at.year,
        founded_at_month: founded_at.month,
        maximum_members: 35,
        vegetable_products: nil,
        animal_products: %w{fish},
        beverages: nil,
        additional_product_information: 'Frischer Fisch aus dem Teupitzer See: Hecht, Barsch, Makrele',
        acts_ecological: true,
        economical_behavior: "Bei uns ist noch alles biologisch.",
        participation: 'Im Frühling und Herbst brauchen wir Hilfe beim Sichern der Boote und Stellnetze. In harten Wintern müssen wir regelmäßig Eis hacken, damit uns die Stege nicht zerdrückt werden.'
      farm5.users = [user4]
      geocode(farm5)
      farm5.save!
      puts 'New farm created: ' << farm5.name

      puts 'SETTING UP SOME DEPOTS'
      depot1 = Depot.new name: 'Café Restaurant Villa Rixdorf',
        city: 'Berlin',
        address: 'Richardplatz 6',
        description: 'Das Café Rixdorf und unsere Gruppe treffen sich Donnerstag gegen 18 Uhr zur Übergabe.'
      depot1.users = [user1]
      geocode(depot1)
      depot1.save!
      puts 'New depot created: ' << depot1.name

      depot2 = Depot.new name: 'Gemüsefreunde Wedding',
        city: 'Berlin',
        address: 'Malplaquetstr. 10',
        description: 'Wir sind eine Gruppe von Menschen aus dem Wedding, die mit dem Gutshof Neuruppin solidarische Landwirtschaft betreiben'
      depot2.users = [user2]
      geocode(depot2)
      depot2.save!
      puts 'New depot created: ' << depot2.name

      depot3 = Depot.new name: 'Con Calma',
        city: 'Berlin',
        address: 'Schönfließer Straße 16',
        description: 'Wir sind eine Gruppe von Menschen aus dem Prenzlberg, die mit dem Gutshof Neuruppin solidarische Landwirtschaft betreiben'
      depot3.users = [user2]
      geocode(depot3)
      depot3.save!
      puts 'New depot created: ' << depot3.name

      depot4 = Depot.new name: 'Bioladen Kungerkitz',
        city: 'Berlin',
        address: 'Bouchestraße 12',
        description: 'Unsere Gruppe in Treptow ist relativ klein. Wir freuen uns über neue Gesichter.'
      depot4.users = [user1]
      geocode(depot4)
      depot4.save!
      puts 'New depot created: ' << depot4.name

      depot5 = Depot.new name: 'Fröhliche Gärtnerei, Standort Schöneberg',
        city: '10825 Berlin',
        address: 'Badensche Straße 52',
        description: 'Der Neukoelln Standort 1 ist ein Depot der Fröhlichen Gärtnerei!'
      depot5.users = [user1]
      geocode(depot5)
      depot5.save!
      puts 'New depot created: ' << depot5.name

      depot6 = Depot.new name: 'Fröhliche Gärtnerei, Standort Kreuzberg',
        city: 'Berlin',
        address: 'Kottbusser Tor',
        description: 'Einige unserer Mitglieder sind mit einem Stand auf dem Fair Camp 2013 am Samstag, 19.1. vertreten. Wer sich für eine Mitgliedschaft (besonders in Pankow) interessiert, kann gerne ins Gespräch kommen! Fair Camp am 19.1. ab 10.00 Uhr'
      depot6.users = [user1]
      geocode(depot6)
      depot6.save!
      puts 'New depot created: ' << depot6.name

      depot7 = Depot.new name: 'Marianne-Cohn-Schule',
        city: 'Berlin',
        address: 'Holzmannstrasse 7',
        description: 'Wir nutzen die Schule als Verteilerstation für die Lieferungen vom Hof Reesdorf und von der Fischerei Böhnke'
      depot7.users = [user4]
      geocode(depot7)
      depot7.save!
      puts 'New depot created: ' << depot7.name

      depot8 = Depot.new name: 'Wiener Conditorei Caffeehaus',
        city: 'Berlin',
        address: 'Hohenzollerndamm 92',
        description: 'Der Hof Reesdorf liefert einmal wöchentlich seine Ernte im Café ab.'
      depot8.users = [user3]
      geocode(depot8)
      depot8.save!
      puts 'New depot created: ' << depot8.name

      depot9 = Depot.new name: 'Templiner Eck',
        city: 'Potsdam',
        address: 'Leipziger Straße 28',
        description: 'Unsere Mitglieder treffen sich Montags mit unserem Kontakt vom Hof Reesdorf. Am Freitag besucht uns Frau Böhnke vom Fischerei-Betrieb'
      depot9.users = [user3]
      geocode(depot9)
      depot9.save!
      puts 'New depot created: ' << depot9.name

      depot2.places << farm1
      depot3.places << farm1

      depot2.places << farm2
      depot3.places << farm2

      depot1.places << farm3
      depot4.places << farm3
      depot5.places << farm3
      depot6.places << farm3

      depot7.places << farm4
      depot8.places << farm4
      depot9.places << farm4

      depot7.places << farm5
      depot9.places << farm5

    end
  end
end
