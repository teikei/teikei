require 'spec_helper'

describe "/api/v1/geocoder" do
  let(:url) { "/api/v1" }

  context "as a user with role 'user'" do
    let(:user) { create(:user) }
    let(:token) { user.authentication_token }

    before do
      api_sign_in(url, user)
    end

    it "returns latitude and longitude for a valid location" do
      params = {}
      params[:location] = "Berlin"
      params[:auth_token] = token
      get "#{url}/geocode", params
      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response["address"]).not_to be_nil
      expect(response["longitude"]).not_to be_nil
      expect(response["latitude"]).not_to be_nil
    end
  end

  context "as a user with role 'admin'" do
    let(:user) { create(:admin) }
    let(:token) { user.authentication_token }

    before do
      api_sign_in(url, user)
    end

    it "returns latitude and longitude for a valid location" do
      params = {}
      params[:location] = "Berlin"
      params[:auth_token] = token
      get "#{url}/geocode", params
      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response["address"]).not_to be_nil
      expect(response["longitude"]).not_to be_nil
      expect(response["latitude"]).not_to be_nil
    end
  end

  context "as an anonymous user" do
    let(:token) { nil }

    it "returns an authorization error" do
      params = {}
      params[:location] = "Berlin"
      get "#{url}/geocode", auth_token: token
      expect(last_response.status).to eq(401)
    end
  end

end
