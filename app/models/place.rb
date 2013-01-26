class Place < ActiveRecord::Base
  geocoded_by :location
  after_validation :geocode

  acts_as_superclass

  attr_accessible :location, :name, :lat, :lng, :subtype
  belongs_to :user


  def self.response_hash_for_places(places)
    places_hash = Array.new
    places.each do |place|
      place_hash = self.response_hash_for_place(place)
      places_hash.push(place_hash)
    end
    return places_hash
  end

  def self.response_hash_for_place(place)
    hash = Hash.new
    hash["id"] = place.id
    hash["name"] = place.name
    hash["location"] = place.location
    hash["latitude"] = place.latitude
    hash["longitude"] = place.longitude
    hash["subtype"] = place.subtype
    hash["user_id"] = place.user_id
    hash["created_at"] = place.created_at
    hash["updated_at"] = place.updated_at
    return hash
  end

end
