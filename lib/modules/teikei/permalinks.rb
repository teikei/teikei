module Teikei
  module Permalinks
    # Returns the address to the place details page
    # Example: http://ernte-teilen.org/places/23/details
    def place_details_address(place_id)
      "#{root_url}#/places/#{place_id}/details"
    end
  end
end
