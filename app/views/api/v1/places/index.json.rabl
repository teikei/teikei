collection @places
attributes :id, :name, :city, :address, :latitude, :longitude,
:accepts_new_members, :is_established, :description, :contact_name,
:contact_phone, :type, :user_id, :updated_at, :vegetable_products,
:animal_products, :beverages, :additional_product_information
attributes :contact_email, :if => lambda { |p| p.authorized? current_user }
