collection @places

attributes :id, :name, :city, :address, :latitude, :longitude,
  :accepts_new_members, :is_established, :description, :contact_name
attributes :contact_email, :if => lambda { |p| p.authorized? current_user }
attributes :contact_phone, :contact_url

# farm attributes actually, not place attributes.
# but included here for map tooltip display
attributes :vegetable_products, :animal_products, :beverages

attributes :type, :user_id, :updated_at
