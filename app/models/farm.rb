class Farm < ActiveRecord::Base
  inherits_from :place
  resourcify

  def self.response_hash_for_farms(farms)
    farms_hash = Array.new
    farms.each do |farm|
      farm_hash = self.response_hash_for_farm(farm)
      farms_hash.push(farm_hash)
    end
    return farms_hash
  end

  def self.response_hash_for_farm(farm)
    hash = Hash.new
    # hash["place_id"] = farm.place_id
    hash["farm"] = Place.response_hash_for_place(farm.place)
    hash["created_at"] = farm.created_at
    hash["updated_at"] = farm.updated_at
    return hash
  end

end
