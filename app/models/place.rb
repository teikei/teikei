class Place < ActiveRecord::Base
  geocoded_by :location
  after_validation :geocode

  acts_as_superclass

  attr_accessible :location, :name, :latitude, :longitude, :subtype
  belongs_to :user

  has_many :place_connections, foreign_key: :place_a_id, dependent: :destroy
  has_many :places, through: :place_connections, source: :place_b
  has_many :reverse_place_connections, class_name: :PlaceConnection, foreign_key: :place_b_id, dependent: :destroy
end
