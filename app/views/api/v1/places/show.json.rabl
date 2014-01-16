extends "api/v1/places/index"

# additional attributes for Depot
attributes :delivery_days,
  :if => lambda { |p| p.type == 'Depot' }

# additional attributes for Farm
attributes :founded_at_year, :founded_at_month, :maximum_members,
  :additional_product_information, :participation,
  :acts_ecological, :economical_behavior,
  :contact_function,
  :if => lambda { |p| p.type == 'Farm' }
