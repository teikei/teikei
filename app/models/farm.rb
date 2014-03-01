class Farm < Place
  extend Enumerize

  attr_accessible :founded_at_year, :founded_at_month, :maximum_members, :accepts_new_members,
  :vegetable_products, :animal_products, :beverages,
  :additional_product_information, :participation,
  :acts_ecological, :economical_behavior,
  :contact_function, :url

  serialize :vegetable_products, Array
  enumerize :vegetable_products, in: %w{vegetables fruits mushrooms cereals bread_and_pastries spices}, multiple: true
  serialize :animal_products, Array
  enumerize :animal_products, in: %w{eggs meat sausages milk dairy fish honey}, multiple: true
  serialize :beverages, Array
  enumerize :beverages, in: %w{juice wine beer}, multiple: true

  resourcify

  before_validation :validate_url_format

  validates :founded_at_year, numericality: { only_integer: true, greater_than: 0 }, allow_blank: true
  validates :founded_at_month, numericality: { only_integer: true }, inclusion: { within: 1..12 }, allow_blank: true
  validates :description, length: { maximum: 1000 }
  validates :maximum_members, numericality: { only_integer: true }, inclusion: { within: 0..500 }, allow_blank: true
  validates :additional_product_information, length: { maximum: 1000 }
  validates :participation, length: { maximum: 1000 }
  validates :acts_ecological, inclusion: { within: [true, false], message: "is not a boolean value" }
  validates :economical_behavior, length: { maximum: 1000 }
  validates :accepts_new_members, inclusion: { within: [ "yes", "no", "waitlist" ], message: "is an invalid value" }
  validates :contact_function, length: { maximum: 100 }
  validates :url, length: { maximum: 100 }, format: URI.regexp(['http', 'https']), allow_blank: true


  def aggregated_places
    # return all (directly) related places of this farm
    self.related_places
  end

  private

  def validate_url_format
    return if !self.url || self.url.empty?
    valid = true
    begin
      uri = URI.parse(self.url)
      if uri.scheme
        valid = validate_scheme(uri.scheme)
      else
        prefix_url_scheme
      end
    rescue URI::InvalidURIError
      valid = false
    end
    errors.add(:url) unless valid
  end

  def validate_scheme(scheme)
    %w(http https).include?(scheme) if scheme
  end

  def prefix_url_scheme
    self.url = "http://#{self.url}"
  end
end
