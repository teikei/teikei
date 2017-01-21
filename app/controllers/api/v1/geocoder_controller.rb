class Api::V1::GeocoderController < ApplicationController
  respond_to :json

  MAPZEN_HOST = 'http://search.mapzen.com'
  API_KEY = 'api_key=' + ENV['MAPZEN_API_KEY']

  def structured_geocode
    render json: call_mapzen('/v1/search/structured')
  end

  def autocomplete
    render json: call_mapzen('/v1/autocomplete')
  end

  def geocode
    render json: call_mapzen('/v1/search')
  end

  private

  def call_mapzen(url)
    response = HTTParty.get(MAPZEN_HOST + url + '?' + API_KEY + '&' + params.to_query)
    response.body
  end
end
