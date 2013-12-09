object @farm
extends "api/v1/places/show"

child aggregated_places: :places do
  extends "api/v1/places/show"
end

child image: :image do
  extends "api/v1/images/show"
end
