FactoryGirl.define do

  factory :place_message, class: PlaceMessage do
    recipient_name "Valid Recipent"
    recipient_email "valid-email@example.com"
    sender_name "John Doe"
    sender_email "valid-email@example.com"
    message "This is a valid place message."
    mail_form_path "http://www.example.com/place/23/details"
    place_name "My little Farm"
  end

end
