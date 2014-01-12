class Api::V1::GeocoderController < ApplicationController
  respond_to :json

  rescue_from CanCan::AccessDenied do |exception|
    exception.default_message = I18n.t("cancan.errors.unauthorized")
    render json: { error: exception.message }, status: 401
  end

  def geocode
    authorize! :geocode, :location
    query_params = {}
    query_params[:street] = params["street"] if params["street"]
    query_params[:city] = params["city"] if params["city"]
    result = Nominatim.structured_search(query_params).limit(1)
    if result && result.first
      result = result.first
      render json: {latitude: result.lat, longitude: result.lon}
    else
      render json: {error: I18n.t("geocoder.errors.not_found")}, status: 404
    end
  end
end
