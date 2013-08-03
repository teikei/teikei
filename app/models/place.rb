class Place < ActiveRecord::Base
  attr_accessible :name, :city, :address,
    :is_established, :description, :contact_name,
    :contact_email, :contact_phone, :type, :latitude, :longitude

  belongs_to :user

  has_and_belongs_to_many :places, association_foreign_key: :place_b_id, foreign_key: :place_a_id, join_table: :place_connections, class_name: Place
  has_and_belongs_to_many :reverse_places, association_foreign_key: :place_a_id, foreign_key: :place_b_id, join_table: :place_connections, class_name: Place

  validates_presence_of :user
  validates :name, presence: true, length: { in: 5..50 }
  validates :city, presence: true, length: { in: 2..40 }
  validates :address, presence: true, length: { in: 6..40 }
  validates :is_established, inclusion: { within: [true, false], message: "is not a boolean value" }
  validates :latitude, numericality: true, presence: true
  validates :longitude, numericality: true, presence: true
  validates :contact_name, presence: true, length: { in: 2..60 }
  validates :contact_email, presence: true, email: true, length: { maximum: 100 }
  validates :contact_phone, format: { with: /\A(\+\d)?[\d\s\/-]+\Z/, message: "in an invalid phone number" }, allow_blank: true

  has_paper_trail


  def related_places
    (places + reverse_places).uniq
  end

  def related_farms
    related_places_by_type(:Farm)
  end

  def related_depots
    related_places_by_type(:Depot)
  end

  def location
    result = []
    [self.address, self.city].each do |param|
      result << param unless param.blank?
    end
    result.join(' ') unless result.blank?
  end

  def authorized?(user)
    user && ( user.has_role?(:admin) || self.user_id == user.id )
  end

  private

  def related_places_by_type(type)
    (places.where(type: type) + reverse_places.where(type: type)).uniq
  end

end
