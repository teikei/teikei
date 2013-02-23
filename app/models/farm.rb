class Farm < ActiveRecord::Base
  inherits_from :place
  resourcify

  attr_accessible :founded_at, :maximum_members,
  :products, :farming_standard, :participation
end
