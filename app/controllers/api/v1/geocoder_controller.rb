class Api::V1::GeocoderController < ApplicationController
  respond_to :json

  rescue_from CanCan::AccessDenied do |exception|
    exception.default_message = I18n.t("cancan.errors.unauthorized")
    render json: { error: exception.message }, status: 401
  end

  def geocode
    authorize! :geocode, :location
    result = Geocoder.search(params[:location])
    if result && result.size > 0
      render json: {address: result[0].address, latitude: result[0].latitude, longitude: result[0].longitude}
    else
      render json: {error: "Invalid location"}
    end
  end
end
