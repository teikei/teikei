FactoryGirl.define do
  factory :depot do
    name "Depot"
    address "Schivelbeiner Str. 6"
    city "Berlin"
    latitude 52.500556
    longitude 13.398889
    is_established true
    description "The description of the place."
    contact_name "Anna Platz"
    contact_email "anna@teikei.de"
    contact_phone "+49 30 1234567"
    user
  end
end
