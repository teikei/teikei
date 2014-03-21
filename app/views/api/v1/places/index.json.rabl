collection @places

attributes :id, :name, :city, :address, :latitude, :longitude,
  :accepts_new_members, :is_established, :description
attributes :related_places_count

child :ownerships do
  attributes :user_id
end

# farm attributes actually, not place attributes.
# but included here for map tooltip display
attributes :vegetable_products, :animal_products, :beverages
attributes :type, :updated_at
