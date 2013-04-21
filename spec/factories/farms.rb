# encoding: UTF-8

FactoryGirl.define do
  factory :farm do
    name "Testfarm"
    address "Fehrbelliner Str. 45a"
    city "Neuruppin"
    latitude 52.500556
    longitude 13.398889
    is_established true
    description "The description of the place."
    contact_name "Anna Platz"
    contact_function "coordinator"
    contact_email "anna@teikei.de"
    contact_phone "+49 30 1234567"
    contact_url "http://example.com"
    founded_at Date.new(2009,12,01)
    maximum_members 10
    products %w{vegetables fruit dairy bread milk meat}
    farming_standard "biodynamic"
    participation "Garten umgraben ist angesagt"
    user
  end
end
