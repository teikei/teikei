class Depot < ActiveRecord::Base
  inherits_from :place
  resourcify

  def self.response_hash_for_depots(depots)
    depots_hash = Array.new
    depots.each do |depot|
      depot_hash = self.response_hash_for_depot(depot)
      depots_hash.push(depot_hash)
    end
    return depots_hash
  end

  def self.response_hash_for_depot(depot)
    hash = Hash.new
    # hash["place_id"] = depot.place_id
    hash["depot"] = Place.response_hash_for_place(depot.place)
    hash["created_at"] = depot.created_at
    hash["updated_at"] = depot.updated_at
    return hash
  end

end
