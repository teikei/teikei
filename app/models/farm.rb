class Farm < Place
  extend Enumerize

  attr_accessible :founded_at, :maximum_members, :accepts_new_members,
  :products, :farming_standard, :participation, :is_solawi_member

  serialize :products, Array
  enumerize :products, in: %w{vegetables fruit dairy bread milk meat eggs herbs other}, multiple: true
  enumerize :farming_standard, in: %w{organic biodynamic integrated}

  resourcify

  validates :founded_at, presence: true
  validates :maximum_members, presence: true, numericality: { only_integer: true }
  validates :products, presence: true
  validates :farming_standard, presence: true
  validates :participation, presence: true
  validates :is_solawi_member, inclusion: { within: [true, false], message: "is not a boolean value" }
  validates :accepts_new_members, inclusion: { within: [ "yes", "no", "waitlist" ], message: "is a invalid value" }

  def aggregated_places
    self.all_places
  end
end
