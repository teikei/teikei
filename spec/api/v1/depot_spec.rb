require 'spec_helper'

describe "/api/v1/depots" do
  let(:url) { "/api/v1" }

  before do
    @depot1 = create(:depot, name: "depot 1").reload
    @depot2 = create(:depot, name: "depot 2").reload
  end

  def expected_index_response_for(depot)
    { "id" => depot.id,
      "name" => depot.name,
      "address" => depot.address,
      "city" => depot.city,
      "latitude" => depot.latitude.to_s,
      "longitude" => depot.longitude.to_s,
      "accepts_new_members" => depot.accepts_new_members,
      "is_established" => depot.is_established,
      "description" => depot.description,
      "contact_name" => depot.contact_name,
      "contact_email" => depot.contact_email,
      "contact_phone" => depot.contact_phone,
      "subtype" => depot.subtype,
      "user_id" => depot.user_id }
  end

  def expected_show_response_for(depot)
    expected_index_response_for(depot).merge(
      { "places" => depot.places }
    )
  end

  shared_examples_for "a readable depot" do
    it "returns a depot" do
      get "#{url}/depots/#{@depot1.place_id}", auth_token: token

      expect(last_response.status).to eq(200)
      response = JSON.parse(last_response.body)
      expect(response).to eq(expected_show_response_for(@depot1))
    end

    it "returns all depots" do
      get "#{url}/depots", auth_token: token

      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response.size).to eq(2)
      expect(response[0]).to eq(expected_index_response_for(@depot1))
      expect(response[1]).to eq(expected_index_response_for(@depot2))
    end
  end

  shared_examples_for "an editable depot" do
    it "updates the depot"  do
      params = {}
      params[:depot] = {name: "New Name"}
      params[:auth_token] = token
      put "#{url}/depots/#{@depot1.place_id}", params
      expect(last_response.status).to eq(204)
      expect(@depot1.reload.name).to eq("New Name")
    end

    it "updates the places relationships of the depot" do
      params = {}
      params[:places] = [1, 2]
      params[:auth_token] = token
      put "#{url}/depots/#{@depot1.place_id}", params
      expect(last_response.status).to eq(204)
      expect(@depot1.reload.places).to eq([@depot1.place, @depot2.place])
    end

    # special test for the current issue with replacing associations
    # with multiple_table_inheritance
    it "replaces an existing places relationship of the depot" do
      params = {}
      params[:places] = [1, 2]
      params[:auth_token] = token
      put "#{url}/depots/#{@depot1.place_id}", params
      params = {}
      params[:places] = [1, 2]
      params[:auth_token] = token
      put "#{url}/depots/#{@depot1.place_id}", params
      expect(last_response.status).to eq(204)
      expect(@depot1.reload.places).to eq([@depot1.place, @depot2.place])
    end

    it "deletes the depot" do
      expect {
        params = {}
        params[:auth_token] = token
        delete "#{url}/depots/#{@depot1.place_id}", params
      }.to change { Depot.count }.by(-1)
      expect(last_response.status).to eq(204)
    end
  end

  shared_examples_for "a non-editable depot" do
    it "does not update the depot"  do
      params = {}
      params[:depot] = {name: "New Name"}
      params[:auth_token] = token
      put "#{url}/depots/#{@depot2.place_id}", params
      expect(last_response.status).to eq(401)
      expect(@depot2.reload.name).not_to eq("New Name")
    end

    it "does not delete the depot" do
      params = {}
      expect {
        params[:auth_token] = token
        delete "#{url}/depots/#{@depot2.place_id}", params
      }.not_to change { Depot.count }
      expect(last_response.status).to eq(401)
    end
  end

  context "as an anonymous user" do
    let(:token) { nil }

    it_behaves_like "a readable depot"

    it "does not add a new depot" do
      expect {
        params = {}
        params[:depot] = attributes_for(:depot, name: "depot3")
        post "#{url}/depots", params
      }.not_to change { Depot.count }
      expect(last_response.status).to eq(401)
    end

  end

  context "as a user with role 'user'" do
    let(:user) { create(:user) }
    let(:token) { user.authentication_token }

    before do
      api_sign_in(url, user)
      @depot1.user = user
      @depot1.save!
      @depot2.user = nil
      @depot2.save!
    end

    it_behaves_like "a readable depot"

    it "adds a new depot that is owned by the user" do
      expect {
        params = {}
        params[:depot] = attributes_for(:depot, name: "depot3")
        params[:auth_token] = token
        post "#{url}/depots", params
      }.to change { Depot.count }.by(1)
      expect(last_response.status).to eq(201)
      expect(Depot.last.name).to eq("depot3")
      expect(Depot.last.user).to eq(user)
    end

    context "when the owner" do
      it_behaves_like "an editable depot"
    end

    context "when not the owner" do
      it_behaves_like "a non-editable depot"
    end
  end

  context "as a user with role 'admin'" do
    let(:user) { create(:admin) }
    let(:token) { user.authentication_token }

    before do
      api_sign_in(url, user)
      @depot1.user = user
      @depot1.save!
      @depot2.user = nil
      @depot2.save!
    end

    it_behaves_like "a readable depot"
    it_behaves_like "an editable depot"

    it "adds a new depot that is owned by the user" do
      expect {
        params = {}
        params[:depot] = attributes_for(:depot, name: "depot3")
        params[:auth_token] = token
        post "#{url}/depots", params
      }.to change { Depot.count }.by(1)
      expect(last_response.status).to eq(201)
      expect(Depot.last.user).to eq(user)
    end
  end
end
