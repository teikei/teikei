require 'rails_helper'

describe '/api/v1/geocoder', type: :request do
  let(:url) { '/api/v1' }

  it 'returns coordinates for a valid location' do
    params = {}
    params[:text] = 'Alexanderplatz, Berlin'

    get "#{url}/geocode", params
    expect(last_response).to be_ok
    response = JSON.parse(last_response.body)
    expect(response['features'][0]['geometry']['coordinates']).not_to be_nil
  end

end
