object @farm
extends "api/v1/places/show"

attributes :founded_at_year, :founded_at_month, :maximum_members,
  :additional_product_information, :participation,
  :acts_ecological, :economical_behavior,
  :contact_function, :url

child aggregated_places: :places do
  extends "api/v1/places/show"
end

child image: :image do
  extends "api/v1/images/show"
end
