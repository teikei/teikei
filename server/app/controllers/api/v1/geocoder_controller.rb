require 'uri'

class Api::V1::GeocoderController < ApplicationController
  respond_to :json

  GEOCODING_HOST = 'https://geocoder.api.here.com'
  AUTOCOMPLETE_HOST = 'https://autocomplete.geocoder.api.here.com/6.2/suggest.json'

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
    location = call_geocoder(params[:id])
    render json: location
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
      results.uniq!
      results.reject(&:blank?)
    else
      []
    end
  end

  def parse_autocomplete_response(l)
    unless ['country', 'state', 'county'].include? l['matchLevel']
      {name: l['label'],
      id: l['locationId'],
      type: 'location'}
    end
  end

  def call_geocoder(id)
    uri = URI.parse(GEOCODING_HOST)
    uri.path = '/6.2/geocode.json'
    uri.query = URI.encode_www_form(
      'app_id' => ENV['GEOCODER_APP_ID'],
      'app_code' => ENV['GEOCODER_APP_CODE'],
      'locationid' => id,
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

  def parse_geocoder_response(response)
    l = response['Location']

    {name: l['Address']['Label'],
     lon: l['DisplayPosition']['Longitude'],
     lat: l['DisplayPosition']['Latitude'],
     id: l['LocationId'],
     address: [l['Address']['Street'], l['Address']['HouseNumber']].join(" ").rstrip,
     city: l['Address']['City'],
     country: l['Address']['Country']}
  end
end
