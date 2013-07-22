class Api::V1::BaseController < InheritedResources::Base
  load_and_authorize_resource

  respond_to :json, except: [:new, :edit]

  rescue_from CanCan::AccessDenied do |exception|
    render json: exception.message, status: 401
  end

  rescue_from Exception do |exception|
    render json: { errors: exception.message }, status: 401
  end

  def assign_places(model)
    places_params = params[:places]
    if places_params
      place_ids = if places_params[0].is_a? Hash
                    places_params.map { |p| p[:id].to_i }
                  else
                    places_params
                  end
      model.places = Place.find(place_ids)
    end
  end
end
