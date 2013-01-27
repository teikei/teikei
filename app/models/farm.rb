class Farm < ActiveRecord::Base
  inherits_from :place
  resourcify

  def as_json(options)
    self.response_hash
  end

  def response_hash
    hash = Hash.new
    hash["place_id"] = place_id
    hash["farm"] = self.place.response_hash
    hash["created_at"] = created_at
    hash["updated_at"] = updated_at
    return hash.unnest
  end

end
