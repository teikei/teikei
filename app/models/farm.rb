class Farm < Place
  extend Enumerize

  attr_accessible :founded_at_year, :founded_at_month, :maximum_members, :accepts_new_members,
  :products, :farming_standard, :participation, :is_solawi_member,
  :contact_function, :contact_url

  serialize :products, Array
  enumerize :products, in: %w{vegetables fruit dairy bread milk meat eggs herbs other}, multiple: true
  enumerize :farming_standard, in: %w{organic biodynamic integrated}

  resourcify

  validates :founded_at_year, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :founded_at_month, numericality: { only_integer: true }, inclusion: { within: 1..12 }, allow_blank: true
  validates :maximum_members, presence: true, numericality: { only_integer: true }
  validates :products, presence: true
  validates :farming_standard, presence: true
  validates :participation, presence: true
  validates :is_solawi_member, inclusion: { within: [true, false], message: "is not a boolean value" }
  validates :accepts_new_members, inclusion: { within: [ "yes", "no", "waitlist" ], message: "is an invalid value" }
  validates :contact_function, length: { maximum: 60 }
  validates :contact_url, length: { maximum: 60 }, format: URI.regexp(['http', 'https']), allow_blank: true

  def aggregated_places
    self.all_places
  end
end
