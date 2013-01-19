require 'spec_helper'

describe "/api/v1/depots" do
  let(:url) { "/api/v1" }

  before do
    @depot1 = create(:depot, name: "Depot 1")
    @depot2 = create(:depot, name: "Depot 2")
  end

  shared_examples_for "read access to all depots" do

    it "returns a depot with details" do
      get "#{url}/depots/#{@depot1.id}.json", auth_token: :token

      expect(last_response).to be_ok
      expect(last_response.body).to eq(@depot1.to_json)
    end

    it "returns all depots without details" do
      get "#{url}/depots.json", auth_token: :token

      expect(last_response).to be_ok
      expect(last_response.body).to eq([@depot1, @depot2].to_json)
    end
  end

  context "as an anonymous user" do
    let(:token) { nil }

    it_behaves_like "read access to all depots"
  end


  context "as a user with role 'user'" do
    let(:user) { create(:user) }
    let(:token) { user.authentication_token }

    before do
      @depot1.user user
      @depot2.user user
    end

    it_behaves_like "read access to all depots"
  end

  context "as a user with role 'admin'" do
    let(:user) { create(:admin) }
    let(:token) { user.authentication_token }

    before do
      @depot1.user user
      @depot2.user user
    end

    it_behaves_like "read access to all depots"
  end
end
