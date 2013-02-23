class Farm < Place
  resourcify

  attr_accessible :founded_at, :maximum_members,
  :products, :farming_standard, :participation
end
