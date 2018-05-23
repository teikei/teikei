FactoryBot.define do
  factory :place do
    name 'Test Place'
    city 'Berlin'
    latitude 52.500556
    longitude 13.398889
    url 'http://example.com'
    description 'The description of the place.'
    image
    after(:create) do |place|
      place.users << create(:user)
    end
  end
end
