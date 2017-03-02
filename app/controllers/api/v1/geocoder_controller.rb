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

  def search
    render json: call_mapzen('/v1/search')
  end

  def combined_search
    places = Place.fuzzy_search(name: params[:text])
    locations = call_mapzen('/v1/autocomplete')
    places = places.map { |p|
      {name: p.name,
       lat: p.latitude,
       lon: p.longitude,
       type: p.type.downcase,
       id: p.id}
    }
    render json: places.concat(locations)
  end

  private

  def call_mapzen(url)
    response = HTTParty.get(MAPZEN_HOST + url + '?' + API_KEY + '&' + params.to_query)
    results = JSON.parse(response.body)['features']
    if results
      results.map { |l|
        {name: l['properties']['label'].gsub(/, Germany/, ''),
         lat: l['geometry']['coordinates'][1],
         lon: l['geometry']['coordinates'][0],
         id: l['properties']['id'],
         type: 'location'}
      }
    else
      []
    end
  end
end
