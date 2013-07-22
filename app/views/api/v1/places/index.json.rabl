collection @places
attributes :id, :name, :city, :address, :latitude, :longitude,
:accepts_new_members, :is_established, :description, :contact_name,
:contact_phone, :type, :user_id, :updated_at, :products
attributes :contact_email, :if => lambda { |p| (current_user && current_user.has_role?(:admin)) || p.user == current_user }
