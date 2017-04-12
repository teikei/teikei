class Api::V1::GeocoderController < ApplicationController
  respond_to :json

  MAPZEN_HOST = 'http://search.mapzen.com'
  API_KEY = 'api_key=' + ENV['MAPZEN_API_KEY']

  SEARCHBOUNDS_MIN_LON = '5.625'
  SEARCHBOUNDS_MAX_LON = '15.1611328125'
  SEARCHBOUNDS_MIN_LAT = '45.7368595474'
  SEARCHBOUNDS_MAX_LAT = '55.2290230574'

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
       id: p.id,
       address: p.address,
       city: p.city,
       type: p.type.downcase}
    }
    render json: places.concat(locations)
  end

  private

  def call_mapzen(url)
    response = HTTParty.get(MAPZEN_HOST + url + '?' + API_KEY + '&' + params.to_query +
    '&boundary.rect.min_lon=' + SEARCHBOUNDS_MIN_LON +
    '&boundary.rect.max_lon=' + SEARCHBOUNDS_MAX_LON +
    '&boundary.rect.min_lat=' + SEARCHBOUNDS_MIN_LAT +
    '&boundary.rect.max_lat=' + SEARCHBOUNDS_MAX_LAT +
    '&layers=address')
    results = JSON.parse(response.body)['features']
    if results
      results.map { |l|
        {name: "#{l['properties']['street']} #{l['properties']['housenumber']}, #{l['properties']['locality']}",
         lat: l['geometry']['coordinates'][1],
         lon: l['geometry']['coordinates'][0],
         id: l['properties']['id'],
         address: "#{l['properties']['street']} #{l['properties']['housenumber']}",
         city: l['properties']['locality'],
         type: 'location'}
      }
    else
      []
    end
  end
end
