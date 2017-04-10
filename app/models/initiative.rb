class Initiative < Place
  attr_accessible :initiative_goals

  validates :initiative_goals, numericality: { only_integer: true }, inclusion: { within: 0..4 }, allow_blank: true

  resourcify
end
