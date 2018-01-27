require 'uri'

class Api::V1::GeocoderController < ApplicationController
  respond_to :json

  GEOCODING_HOST = 'https://geocoder.cit.api.here.com'

  def search
    # TODO text as query string? request param instead?
    places = Place.fuzzy_search(name: params[:text])
    locations = call_mapbox(params[:text])
    places = places.map {|p|
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

  def call_mapbox(text)
    uri = URI.parse(GEOCODING_HOST)
    uri.path = '/6.2/geocode.json'
    uri.query = URI.encode_www_form(
        'app_id' => ENV['GEOCODER_APP_ID'],
        'app_code' => ENV['GEOCODER_APP_CODE'],
        'searchtext' => text
        # 'country' => 'DE,CH,AT,LI',
        # 'country' => 'CH',
        # 'language' => I18n.locale
        # 'types' => 'place,locality,neighborhood,address,poi'
    )

    response = HTTParty.get(uri.to_s)
    data = JSON.parse(response.body)['features']
    if data
      results = data.map {|l| parse_geocoder_response(l)}
      results.uniq
    else
      []
    end
  end

  def parse_geocoder_response(l)
    {name: l['place_name'],
     lon: l['center'][0],
     lat: l['center'][1],
     id: l['id'],
     address: l['properties']['address'],
     # TODO determine city
     city: l['text'],
     # application response type: location=geocoding result, farm|initiative|depot=places
     type: 'location'}
  end
end
