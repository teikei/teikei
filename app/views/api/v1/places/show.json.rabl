extends "api/v1/places/index"
object @place
child :aggregated_places => :places do
  attributes :id
  extends "api/v1/places/index"
end
