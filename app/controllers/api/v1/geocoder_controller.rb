class Api::V1::GeocoderController < ApplicationController
  respond_to :json

  rescue_from CanCan::AccessDenied do |exception|
    exception.default_message = I18n.t('cancan.errors.unauthorized')
    render json: {error: exception.message}, status: 401
  end

  def structured_geocode
    authorize! :geocode, :location
    result = Nominatim.search
                 .city(params[:city])
                 .street(params[:housenumber], params[:street])
                 .limit(1)
    if result && result.first
      render json: result.first
    else
      render json: {error: I18n.t('geocoder.errors.not_found')}, status: 404
    end
  end

  def geocode
    authorize! :geocode, :location
    result = Nominatim.search(params[:location])
    if result
      render json: result
    else
      render json: {error: I18n.t('geocoder.errors.not_found')}, status: 404
    end
  end
end
