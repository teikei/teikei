require 'spec_helper'

describe "/api/v1/depots" do
  let(:url) { "/api/v1" }

  before do
    @depot1 = create(:depot, name: "Depot 1")
    @depot2 = create(:depot, name: "Depot 2")
  end

  shared_examples_for "allows read access" do
    it "returns a depot" do
      get "#{url}/depots/#{@depot1.id}.json", auth_token: token

      expect(last_response.status).to eq(200)
      expect(last_response.body).to eq(@depot1.to_json)
    end

    it "returns all depots" do
      get "#{url}/depots.json", auth_token: token

      expect(last_response).to be_ok
      expect(last_response.body).to eq([@depot1, @depot2].to_json)
    end
  end

  context "as an anonymous user" do
    let(:token) { nil }

    it_behaves_like "allows read access"

    it "does not add a new depot" do
      expect {
        params = {}
        params[:depot] = attributes_for(:depot, name: "Depot3")
        post "#{url}/depots.json", params
      }.not_to change { Depot.count }
      expect(last_response.status).to eq(401)
    end

  end

  context "as a user with role 'user'" do
    let(:user) { create(:user) }
    let(:token) { user.authentication_token }

    before do
      @depot1.user = user
      @depot1.save!
      @depot2.user = nil
      @depot2.save!
    end

    it_behaves_like "allows read access"

    it "adds a new depot" do
      expect {
        params = {}
        params[:depot] = attributes_for(:depot, name: "Depot3")
        params[:auth_token] = token
        post "#{url}/depots.json", params
      }.to change { Depot.count }.by(1)
      expect(last_response.status).to eq(201)
      expect(Depot.last.name).to eq("Depot3")
      # expect(Depot.last.user).to be(user)
    end

    context "when the owner" do
      it "updates the depot"  do
        params = {}
        params[:depot] = {name: "New Name"}
        params[:auth_token] = token
        put "#{url}/depots/#{@depot1.place_id}.json", params
        expect(last_response.status).to eq(204)
        expect(@depot1.reload.name).to eq("New Name")
      end

      it "deletes the depot" do
        expect {
          params = {}
          params[:auth_token] = token
          delete "#{url}/depots/#{@depot1.place_id}.json", params
        }.to change { Depot.count }.by(-1)
        expect(last_response.status).to eq(204)
      end
    end

    context "when not the owner" do
      it "does not update the depot"  do
        params = {}
        params[:depot] = {name: "New Name"}
        params[:auth_token] = token
        put "#{url}/depots/#{@depot2.place_id}.json", params
        expect(last_response.status).to eq(401)
        expect(@depot2.reload.name).not_to eq("New Name")
      end

      it "does not delete the depot" do
        expect {
          params = {}
          params[:auth_token] = token
          delete "#{url}/depots/#{@depot2.id}.json", params
        }.not_to change { Depot.count }
        expect(last_response.status).to eq(401)
      end
    end
  end

  context "as a user with role 'admin'" do
    let(:user) { create(:admin) }
    let(:token) { user.authentication_token }

    before do
      @depot1.user = user
      @depot1.save!
      @depot2.user = nil
      @depot2.save!
    end

    it_behaves_like "allows read access"

    it "adds a new depot" do
      expect {
        params = {}
        params[:depot] = attributes_for(:depot, name: "Depot3")
        params[:auth_token] = token
        post "#{url}/depots.json", params
      }.to change { Depot.count }.by(1)
      expect(last_response.status).to eq(201)
      # expect(Depot.last.user).to be(user)
    end

    context "when the owner" do
      it "updates the depot"  do
        params = {}
        params[:depot] = {name: "New Name"}
        params[:auth_token] = token
        put "#{url}/depots/#{@depot1.place_id}.json", params
        expect(last_response.status).to eq(204)
        expect(@depot1.reload.name).to eq("New Name")
      end

      it "deletes the depot" do
        expect {
          params = {}
          params[:auth_token] = token
          delete "#{url}/depots/#{@depot1.place_id}.json", params
        }.to change { Depot.count }.by(-1)
        expect(last_response.status).to eq(204)
      end
    end

    context "when not the owner" do
      it "updates the depot"  do
        params = {}
        params[:depot] = {name: "New Name"}
        params[:auth_token] = token
        put "#{url}/depots/#{@depot2.place_id}.json", params
        expect(last_response.status).to eq(204)
        expect(@depot2.reload.name).to eq("New Name")
      end

      it "deletes the depot" do
        expect {
          params = {}
          params[:auth_token] = token
          delete "#{url}/depots/#{@depot1.place_id}.json", params
        }.to change { Depot.count }.by(-1)
        expect(last_response.status).to eq(204)
      end
    end
  end
end
