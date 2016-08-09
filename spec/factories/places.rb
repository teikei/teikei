FactoryGirl.define do
  factory :place do
    name 'Test Place'
    address 'Alexanderplatz 1'
    city 'Berlin'
    latitude 52.500556
    longitude 13.398889
    is_established true
    description 'The description of the place.'
    image
    after(:create) do |place|
      place.users << create(:user)
    end
  end
end
