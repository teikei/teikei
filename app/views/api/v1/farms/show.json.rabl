object @farm
extends "api/v1/places/show"
if action_name == "show"
  attributes :places
end
