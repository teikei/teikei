# encoding: UTF-8

FactoryGirl.define do
  factory :farm, parent: :place, class: :farm do
    founded_at_year 2009
    founded_at_month 12
    maximum_members 10
    vegetable_products %w{cereals spices mushrooms bread_and_pastries}
    animal_products %w{dairy milk fish honey}
    beverages %w{beer wine}
    additional_product_information 'Bei uns gibt es einmalige Produkte.'
    acts_ecological true
    economical_behavior 'Alles wird biologisch angebaut.'
    participation 'Garten umgraben ist angesagt'
    accepts_new_members 'yes'
    url 'http://example.com'
    contact_function 'coordinator'
    factory :orphan_farm do
      after(:create) do |farm|
        farm.users = []
      end
    end
  end
end
