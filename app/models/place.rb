class Place < ActiveRecord::Base
  attr_accessible :name, :city, :address,
    :is_established, :description,
    :type, :latitude, :longitude

  has_many :ownerships
  has_many :users, through: :ownerships
  has_one :image
  accepts_nested_attributes_for :image

  has_and_belongs_to_many :places, association_foreign_key: :place_b_id, foreign_key: :place_a_id, join_table: :place_connections, class_name: Place
  has_and_belongs_to_many :reverse_places, association_foreign_key: :place_a_id, foreign_key: :place_b_id, join_table: :place_connections, class_name: Place

  validates :name, presence: true, length: { maximum: 100 }
  validates :city, presence: true, length: { maximum: 100 }
  validates :address, presence: true, length: { maximum: 100 }
  validates :is_established, inclusion: { within: [true, false], message: "is not a boolean value" }
  validates :latitude, numericality: true, presence: true
  validates :longitude, numericality: true, presence: true

  has_paper_trail

  def related_places_count
    related_places.length
  end

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
    user && ( user.has_role?(:admin) || owned_by?(user))
  end

  def owned_by?(user)
    user && ( users.any? { |u| u.id == user.id })
  end

  private

  def related_places_by_type(type)
    (places.where(type: type) + reverse_places.where(type: type)).uniq
  end
end
