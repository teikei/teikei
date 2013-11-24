class Depot < Place
  resourcify
  attr_accessible :place_ids, :delivery_days

  def aggregated_places
    # return all (directly) related farms of the depot
    network = related_farms.dup
    # and everything else related to these farms
    related_farms.each do |farm|
     network.push(*farm.related_places)
    end
    # exclude the current depot
    network.reject { |p| p == self }
  end

end
