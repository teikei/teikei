class Place < ActiveRecord::Base
  geocoded_by :location
  after_validation :geocode

  acts_as_superclass

  attr_accessible :location, :name, :latitude, :longitude, :subtype
  belongs_to :user

  def as_json(options)
    self.response_hash
  end

  def response_hash
    hash = Hash.new
    hash["id"] = id
    hash["name"] = name
    hash["location"] = location
    hash["latitude"] = latitude
    hash["longitude"] = longitude
    hash["subtype"] = subtype
    hash["user_id"] = user_id
    hash["created_at"] = created_at
    hash["updated_at"] = updated_at
    return hash
  end

end
