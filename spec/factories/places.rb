FactoryGirl.define do
  factory :place do
    name "Test Place"
    address "Alexanderplatz 1"
    city "Berlin"
    latitude 52.500556
    longitude 13.398889
    accepts_new_members true
    is_established true
    description "The description of the place."
    contact_name "Anna Platz"
    contact_email "anna@teikei.de"
    contact_phone "+49 30 1234567"
    user_id 23
  end
end
