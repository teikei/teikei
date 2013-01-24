class Place < ActiveRecord::Base
  geocoded_by :location, latitude: :lat, longitude: :lng
  after_validation :geocode

  acts_as_superclass

  attr_accessible :location, :name, :lat, :lng, :subtype
  belongs_to :user

end
