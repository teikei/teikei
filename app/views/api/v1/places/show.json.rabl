extends "api/v1/places/index"

child :ownerships do
  attributes :user_id, :name
  attributes :contact_by_phone, :contact_by_email
  attributes :email, :phone, :if => lambda { |o| o.place.authorized? current_user }
end

child aggregated_places: :places do
  extends "api/v1/places/index"
end
