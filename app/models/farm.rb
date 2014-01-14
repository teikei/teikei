class Farm < Place
  extend Enumerize

  attr_accessible :founded_at_year, :founded_at_month, :maximum_members, :accepts_new_members,
  :vegetable_products, :animal_products, :beverages,
  :additional_product_information, :participation,
  :acts_ecological, :economical_behavior,
  :contact_function, :contact_url

  serialize :vegetable_products, Array
  enumerize :vegetable_products, in: %w{vegetables fruits mushrooms cereals bread_and_pastries spices}, multiple: true
  serialize :animal_products, Array
  enumerize :animal_products, in: %w{eggs meat sausages milk dairy fish honey}, multiple: true
  serialize :beverages, Array
  enumerize :beverages, in: %w{juice wine beer}, multiple: true

  resourcify

  validates :founded_at_year, numericality: { only_integer: true, greater_than: 0 }
  validates :founded_at_month, numericality: { only_integer: true }, inclusion: { within: 1..12 }, allow_blank: true
  validates :maximum_members, numericality: { only_integer: true }, inclusion: { within: 0..500 }, allow_blank: true
  validates :additional_product_information, length: { maximum: 1000 }
  validates :participation, length: { maximum: 1000 }
  validates :acts_ecological, inclusion: { within: [true, false], message: "is not a boolean value" }
  validates :economical_behavior, length: { maximum: 1000 }
  validates :accepts_new_members, inclusion: { within: [ "yes", "no", "waitlist" ], message: "is an invalid value" }
  validates :contact_function, length: { maximum: 100 }
  validates :contact_url, length: { maximum: 100 }, format: URI.regexp(['http', 'https']), allow_blank: true

  def aggregated_places
    # return all (directly) related places of this farm
    self.related_places
  end
end
