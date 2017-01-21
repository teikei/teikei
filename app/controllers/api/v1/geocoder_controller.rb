class Api::V1::GeocoderController < ApplicationController
  respond_to :json

  MAPZEN_HOST = 'http://search.mapzen.com'
  API_KEY = 'api_key=' + ENV['MAPZEN_API_KEY']

  def structured_geocode
    render json: HTTParty.get(MAPZEN_HOST + '/v1/search/structured?' + API_KEY + '&' + params.to_query)
  end

  def autocomplete
    render json: HTTParty.get(MAPZEN_HOST + '/v1/autocomplete?' + API_KEY + '&' + params.to_query)
  end

  def geocode
    render json: HTTParty.get(MAPZEN_HOST + '/v1/search?' + API_KEY + '&' + params.to_query)
  end
end
