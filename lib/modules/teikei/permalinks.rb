module Teikei
  module Permalinks

    # Returns the address to the place details page
    # Example: http://ernte-teilen.org/places/23/details
    def place_details_address(place_id)
      "#{host_address}#/places/#{place_id}/details"
    end

    # Returns the protocol and host address with port
    # Example: http://example.com:8080
    def host_address
      "#{request.protocol}#{request.host_with_port}"
    end

  end
end

