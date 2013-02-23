require 'spec_helper'

describe "/api/v1/farms" do
  let(:url) { "/api/v1" }

  before do
    @farm1 = create(:farm, name: "farm 1").reload
    @farm2 = create(:farm, name: "farm 2").reload
  end

  def expected_index_response_for(farm)
    { "id" => farm.id,
      "name" => farm.name,
      "address" => farm.address,
      "city" => farm.city,
      "latitude" => farm.latitude.to_s,
      "longitude" => farm.longitude.to_s,
      "accepts_new_members" => farm.accepts_new_members,
      "is_established" => farm.is_established,
      "description" => farm.description,
      "contact_name" => farm.contact_name,
      "contact_email" => farm.contact_email,
      "contact_phone" => farm.contact_phone,
      "founded_at" => farm.founded_at,
      "maximum_members" => farm.maximum_members,
      "products" => farm.products,
      "farming_standard" => farm.farming_standard,
      "participation" => farm.participation,
      "subtype" => farm.subtype,
      "user_id" => farm.user_id }
  end

  def expected_show_response_for(farm)
    expected_index_response_for(farm).merge(
      { "places" => farm.places }
    )
  end

  shared_examples_for "a readable farm" do
    it "returns a farm" do
      get "#{url}/farms/#{@farm1.place_id}", auth_token: token

      expect(last_response.status).to eq(200)
      response = JSON.parse(last_response.body)
      expect(response).to eq(expected_show_response_for(@farm1))
    end

    it "returns all farms" do
      get "#{url}/farms", auth_token: token

      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response.size).to eq(2)
      expect(response[0]).to eq(expected_index_response_for(@farm1))
      expect(response[1]).to eq(expected_index_response_for(@farm2))
    end
  end

  shared_examples_for "an editable farm" do
    it "updates the farm"  do
      params = {}
      params[:farm] = {name: "New Name"}
      params[:auth_token] = token
      put "#{url}/farms/#{@farm1.place_id}", params
      expect(last_response.status).to eq(204)
      expect(@farm1.reload.name).to eq("New Name")
    end

    it "updates the places relationships of the farm" do
      params = {}
      params[:places] = [1, 2]
      params[:auth_token] = token
      put "#{url}/farms/#{@farm1.place_id}", params
      expect(last_response.status).to eq(204)
      expect(@farm1.reload.places).to eq([@farm1.place, @farm2.place])
    end

    # special test for the current issue with replacing associations
    # with multiple_table_inheritance
    it "replaces an existing places relationship of the farm" do
      params = {}
      params[:places] = [1, 2]
      params[:auth_token] = token
      put "#{url}/farms/#{@farm1.place_id}", params
      params = {}
      params[:places] = [1, 2]
      params[:auth_token] = token
      put "#{url}/farms/#{@farm1.place_id}", params
      expect(last_response.status).to eq(204)
      expect(@farm1.reload.places).to eq([@farm1.place, @farm2.place])
    end

    it "deletes the farm" do
      expect {
        params = {}
        params[:auth_token] = token
        delete "#{url}/farms/#{@farm1.place_id}", params
      }.to change { Farm.count }.by(-1)
      expect(last_response.status).to eq(204)
    end
  end

  shared_examples_for "a non-editable farm" do
    it "does not update the farm"  do
      params = {}
      params[:farm] = {name: "New Name"}
      params[:auth_token] = token
      put "#{url}/farms/#{@farm2.place_id}", params
      expect(last_response.status).to eq(401)
      expect(@farm2.reload.name).not_to eq("New Name")
    end

    it "does not delete the farm" do
      params = {}
      expect {
        params[:auth_token] = token
        delete "#{url}/farms/#{@farm2.place_id}", params
      }.not_to change { Farm.count }
      expect(last_response.status).to eq(401)
    end
  end

  context "as an anonymous user" do
    let(:token) { nil }

    it_behaves_like "a readable farm"

    it "does not add a new farm" do
      expect {
        params = {}
        params[:farm] = attributes_for(:farm, name: "farm3")
        post "#{url}/farms", params
      }.not_to change { Farm.count }
      expect(last_response.status).to eq(401)
    end

  end

  context "as a user with role 'user'" do
    let(:user) { create(:user) }
    let(:token) { user.authentication_token }

    before do
      api_sign_in(url, user)
      @farm1.user = user
      @farm1.save!
      @farm2.user = nil
      @farm2.save!
    end

    it_behaves_like "a readable farm"

    it "adds a new farm that is owned by the user" do
      expect {
        params = {}
        params[:farm] = attributes_for(:farm, name: "farm3")
        params[:auth_token] = token
        post "#{url}/farms", params
      }.to change { Farm.count }.by(1)
      expect(last_response.status).to eq(201)
      expect(Farm.last.name).to eq("farm3")
      expect(Farm.last.user).to eq(user)
    end

    context "when the owner" do
      it_behaves_like "an editable farm"
    end

    context "when not the owner" do
      it_behaves_like "a non-editable farm"
    end
  end

  context "as a user with role 'admin'" do
    let(:user) { create(:admin) }
    let(:token) { user.authentication_token }

    before do
      api_sign_in(url, user)
      @farm1.user = user
      @farm1.save!
      @farm2.user = nil
      @farm2.save!
    end

    it_behaves_like "a readable farm"
    it_behaves_like "an editable farm"

    it "adds a new farm that is owned by the user" do
      expect {
        params = {}
        params[:farm] = attributes_for(:farm, name: "farm3")
        params[:auth_token] = token
        post "#{url}/farms", params
      }.to change { Farm.count }.by(1)
      expect(last_response.status).to eq(201)
      expect(Farm.last.user).to eq(user)
    end
  end
end
