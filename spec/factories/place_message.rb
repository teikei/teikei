FactoryGirl.define do

  factory :place_message, class: PlaceMessage do
    to "valid-email@example.com"
    sender_name "John Doe"
    sender_email "valid-email@example.com"
    message "This is a valid place message."
  end

  factory :valid_place_message, class: PlaceMessage do
    place_id 1
    to "valid-email@example.com"
    recipient_name "Valid Recipent"
    sender_name "John Doe"
    sender_email "valid-email@example.com"
    message "This is a valid place message."
    mail_form_path "http://www.example.com/place/23/details"
    place_name "My little Farm"
  end

  factory :invalid_place_message, class: PlaceMessage do
    place_id 1
    to "valid-email@example.com"
    sender_email "valid-email@example.com"
    message "This is an invalid place message."
  end

end
