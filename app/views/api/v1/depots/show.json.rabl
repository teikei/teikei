object @depot
extends "api/v1/places/show"

child :aggregated_places => :places do
  extends "api/v1/places/show"
end
