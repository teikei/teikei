collection @places
attributes :id, :name, :city, :address, :latitude, :longitude,
:accepts_new_members, :is_established, :description, :contact_name,
:contact_phone, :contact_url, :type, :user_id, :updated_at
attributes :contact_email, :if => lambda { |p| p.authorized? current_user }
