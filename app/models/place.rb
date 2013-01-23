class Place < ActiveRecord::Base
  acts_as_superclass
  attr_accessible :location, :name, :lat, :lng, :subtype
  belongs_to :user
end
