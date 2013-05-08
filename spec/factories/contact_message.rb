FactoryGirl.define do

  factory :valid_contact_message, class: ContactMessage do
    name "John Doe"
    email "valid-email@example.com"
    message "This is a valid contact message."
  end

  factory :invalid_contact_message, class: ContactMessage do
    email "valid-email@example.com"
    message "This is an invalid contact message."
  end

end
