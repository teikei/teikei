require 'spec_helper'

describe "/api/v1/depots" do
  let(:url) { "/api/v1" }

  context "as an anonymous user" do
    let(:token) { nil }

    it "adds a new user" do
      expect {
        params = {}
        params[:user] = FactoryGirl.attributes_for(:user)
        post "#{url}/users", params
      }.to change { User.count }
      expect(last_response.status).to eq(201)
    end

  end

end
