object @depot
extends "api/v1/places/show"

attributes :delivery_days

child :aggregated_places => :places do
  extends "api/v1/places/show"
end
