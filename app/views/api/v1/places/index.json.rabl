collection @places

attributes :id, :name, :city, :address, :latitude, :longitude,
  :accepts_new_members, :is_established, :description, :contact_name
attributes :contact_email, :if => lambda { |p| p.authorized? current_user }
attributes :contact_phone, :contact_url
attributes :related_places_count

# farm attributes actually, not place attributes.
# but included here for map tooltip display
attributes :vegetable_products, :animal_products, :beverages
attributes :type, :updated_at
child :ownerships do
  attributes :user_id
end
