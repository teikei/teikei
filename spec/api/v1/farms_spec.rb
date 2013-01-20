require 'spec_helper'

describe "/api/v1/farms" do
  let(:url) { "/api/v1" }

  before do
    @farm1 = create(:farm, name: "farm 1")
    @farm2 = create(:farm, name: "farm 2")
  end

  shared_examples_for "allows read access" do
    it "returns a farm" do
      get "#{url}/farms/#{@farm1.id}.json", auth_token: token

      expect(last_response.status).to eq(200)
      expect(last_response.body).to eq(@farm1.to_json)
    end

    it "returns all farms" do
      get "#{url}/farms.json", auth_token: token

      expect(last_response).to be_ok
      expect(last_response.body).to eq([@farm1, @farm2].to_json)
    end
  end

  context "as an anonymous user" do
    let(:token) { nil }

    it_behaves_like "allows read access"

    it "does not add a new farm" do
      expect {
        params = {}
        params[:farm] = attributes_for(:farm, name: "farm3")
        params[:farm] = {name: "farm3"}
        post "#{url}/farms.json", params
      }.not_to change { Farm.count }
      expect(last_response.status).to eq(401)
    end

  end

  context "as a user with role 'user'" do
    let(:user) { create(:user) }
    let(:token) { user.authentication_token }

    before do
      @farm1.user = user
      @farm1.save!
      @farm2.user = nil
      @farm2.save!
    end

    it_behaves_like "allows read access"

    it "adds a new farm" do
      expect {
        params = {}
        params[:farm] = attributes_for(:farm, name: "farm3")
        params[:auth_token] = token
        post "#{url}/farms.json", params
      }.to change { Farm.count }.by(1)
      expect(last_response.status).to eq(201)
      expect(Farm.last.name).to eq("farm3")
      # expect(farm.last.user).to be(user)
    end

    context "when the owner" do
      it "updates the farm"  do
        params = {}
        params[:farm] = {name: "New Name"}
        params[:auth_token] = token
        put "#{url}/farms/#{@farm1.id}.json", params
        expect(last_response.status).to eq(204)
        expect(@farm1.reload.name).to eq("New Name")
      end

      it "deletes the farm" do
        expect {
          params = {}
          params[:auth_token] = token
          delete "#{url}/farms/#{@farm1.id}.json", params
        }.to change { Farm.count }.by(-1)
        expect(last_response.status).to eq(204)
      end
    end

    context "when not the owner" do
      it "does not update the farm"  do
        params = {}
        params[:farm] = {name: "New Name"}
        params[:auth_token] = token
        put "#{url}/farms/#{@farm2.id}.json", params
        expect(last_response.status).to eq(401)
        expect(@farm2.reload.name).not_to eq("New Name")
      end

      it "does not delete the farm" do
        expect {
          params = {}
          params[:auth_token] = token
          delete "#{url}/farms/#{@farm2.id}.json", params
        }.not_to change { Farm.count }
        expect(last_response.status).to eq(401)
      end
    end
  end

  context "as a user with role 'admin'" do
    let(:user) { create(:admin) }
    let(:token) { user.authentication_token }

    before do
      @farm1.user = user
      @farm1.save!
      @farm2.user = nil
      @farm2.save!
    end

    it_behaves_like "allows read access"

    it "adds a new farm" do
      expect {
        params = {}
        params[:farm] = attributes_for(:farm, name: "farm3")
        params[:auth_token] = token
        post "#{url}/farms.json", params
      }.to change { Farm.count }.by(1)
      expect(last_response.status).to eq(201)
      # expect(farm.last.user).to be(user)
    end

    context "when the owner" do
      it "updates the farm"  do
        params = {}
        params[:farm] = {name: "New Name"}
        params[:auth_token] = token
        put "#{url}/farms/#{@farm1.id}.json", params
        expect(last_response.status).to eq(204)
        expect(@farm1.reload.name).to eq("New Name")
      end

      it "deletes the farm" do
        expect {
          params = {}
          params[:auth_token] = token
          delete "#{url}/farms/#{@farm1.id}.json", params
        }.to change { Farm.count }.by(-1)
        expect(last_response.status).to eq(204)
      end
    end

    context "when not the owner" do
      it "updates the farm"  do
        params = {}
        params[:farm] = {name: "New Name"}
        params[:auth_token] = token
        put "#{url}/farms/#{@farm2.id}.json", params
        expect(last_response.status).to eq(204)
        expect(@farm2.reload.name).to eq("New Name")
      end

      it "deletes the farm" do
        expect {
          params = {}
          params[:auth_token] = token
          delete "#{url}/farms/#{@farm1.id}.json", params
        }.to change { Farm.count }.by(-1)
        expect(last_response.status).to eq(204)
      end
    end
  end
end
