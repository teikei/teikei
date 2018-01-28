require 'uri'

class Api::V1::GeocoderController < ApplicationController
  respond_to :json

  GEOCODING_HOST = 'https://geocoder.cit.api.here.com'
  AUTOCOMPLETE_HOST = 'https://autocomplete.geocoder.cit.api.here.com/6.2/suggest.json'

  def autocomplete
    # TODO text as query string? request param instead?
    places = Place.fuzzy_search(name: params[:text])
    locations = call_autocomplete(params[:text])
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

  def geocode
  end

  private

  def call_autocomplete(text)
    uri = URI.parse(AUTOCOMPLETE_HOST)
    uri.query = URI.encode_www_form(
      'app_id' => ENV['GEOCODER_APP_ID'],
      'app_code' => ENV['GEOCODER_APP_CODE'],
      'query' => text,
      'country' => 'DEU,AUT,CHE,LIE',
      'language' => I18n.locale
    )
    
    response = HTTParty.get(uri.to_s)
    data = JSON.parse(response.body)['suggestions']
       
    print response.body

    if data
      results = data.map {|l| parse_autocomplete_response(l)}
      results.uniq
    else
      []
    end
  end

  def parse_autocomplete_response(l)    
    {name: l['label'],
     id: l['locationId'],
     type: 'location'}
  end

  def call_geocoder(text)
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
    data = JSON.parse(response.body)['Response']['View'][0]['Result']
        
    if data
      results = data.map {|l| parse_geocoder_response(l)}
      results.uniq
    else
      []
    end
  end

  def parse_geocoder_response(l)
    locacation = l['Location']
    
    logger.debug "RESPONSE: #{l}"

    {name: location['Address']['Label'],
     lon: location['DisplayPosition']['Longitude'],
     lat: location['DisplayPosition']['Latitude'],
     id: location['LocationId'],
     address: [location['Address']['Street'], location['Address']['HouseNumber']].join(" ").rstrip,
     # TODO determine city
     city: location['Address']['City'],
     # application response type: location=geocoding result, farm|initiative|depot=places
     type: 'location'}  
  end
end
