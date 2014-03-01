extends "api/v1/places/index"

child :ownerships do
  attributes :user_id, :name
  attributes :email, :phone, :if => lambda { |o| o.place.authorized? current_user }
end

attributes :contact_url
