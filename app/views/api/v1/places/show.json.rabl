extends "api/v1/places/index"
object @place
child :aggregated_places => :places do
  # Depot
  attributes :id, :name, :city, :address, :latitude, :longitude,
  :accepts_new_members, :is_established, :description, :contact_name,
  :contact_phone, :type, :user_id, :updated_at
  # Farm
  attributes :founded_at_year, :founded_at_month, :maximum_members, :products, :farming_standard, :participation, :if => lambda { |p| p.type == 'Farm' }
end
