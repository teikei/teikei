require 'spec_helper'

describe "/api/v1/geocoder" do
  let(:url) { "/api/v1" }

  context "as a user with role 'user'" do
    let(:user) { create(:user) }

    before do
      api_sign_in(user)
    end

    it "returns latitude and longitude for a valid location" do
      params = {}
      params[:city] = "Alexanderplatz"
      params[:city] = "Berlin"

      get "#{url}/geocode", params
      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response["longitude"]).not_to be_nil
      expect(response["latitude"]).not_to be_nil
    end
  end

  context "as a user with role 'admin'" do
    let(:user) { create(:admin) }

    before do
      api_sign_in(user)
    end

    it "returns latitude and longitude for a valid location" do
      params = {}
      params[:city] = "Alexanderplatz"
      params[:city] = "Berlin"

      get "#{url}/geocode", params
      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response["longitude"]).not_to be_nil
      expect(response["latitude"]).not_to be_nil
    end
  end

  context "as an anonymous user" do

    it "returns an authorization error" do
      params = {}
      params[:city] = "Alexanderplatz"
      params[:city] = "Berlin"
      get "#{url}/geocode"
      expect_unauthorized_failure(last_response)
    end
  end

end
