FactoryBot.define do

  factory :place_message, class: PlaceMessage do
    name 'John Doe'
    email 'valid-email@example.com'
    message 'This is a valid place message.'
    place_id 1
  end

end
