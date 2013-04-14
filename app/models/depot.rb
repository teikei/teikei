class Depot < Place
  resourcify

  def aggregated_places
    neighbors = self.all_places
    neighbors.each do |neighbor|
      neighbor.places.each do |place|
        neighbors << place if place.is_a? Place
      end
    end
    neighbors.uniq
  end
end
