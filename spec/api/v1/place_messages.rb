require 'spec_helper'

describe "/api/v1/send_message" do

  let(:url) { "/api/v1" }

  it "sends valid place form data" do
    pending "Fix recipient address."
    place = create(:place)
    params = {}
    params[:place_form] = FactoryGirl.attributes_for(:valid_place_message)
    post "#{url}/send_message", params
    expect(last_response.status).to eq(201)
  end

  it "rejects sending invalid place form data" do
    place = create(:place)
    params = {}
    params[:place_form] = FactoryGirl.attributes_for(:invalid_place_message)
    post "#{url}/send_message", params
    expect(last_response.status).to eq(401)
  end

  it "rejects sending place form data containing a non-existing places id" do
    # Places table is currently empty on purpose.
    params = {}
    params[:place_form] = FactoryGirl.attributes_for(:valid_place_message)
    post "#{url}/send_message", params
    expect(last_response.status).to eq(422)
  end

end
