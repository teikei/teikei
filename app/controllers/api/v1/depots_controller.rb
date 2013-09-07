class Api::V1::DepotsController < Api::V1::BaseController
  def update
    assign_places
    update!
  end

  def create
    assign_places
    @depot.user = current_user if current_user
    create!
  end

  def assign_places
    if params[:places].nil?
      @depot.places = []
    else
      places_params = params[:places]
      if places_params
        place_ids = if places_params[0].is_a? Hash
                      places_params.map { |p| p[:id].to_i }
                    else
                      places_params
                    end
        @depot.places = Place.find(place_ids)
      end
    end
  end


end
