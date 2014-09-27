require 'spec_helper'

describe "/api/v1/depots", type: :request do
  let(:url) { "/api/v1" }
  let(:another_user) { create(:user, name: "Another User") }

  before do
    @depot1 = create(:depot, name: "depot 1")
    @depot2 = create(:depot, name: "depot 2")
    @orphan_depot = create(:orphan_depot, name: "Orphan depot")
  end

  def expected_index_response_for(depot, authorized)
    response =
    { "id" => depot.id,
      "name" => depot.name,
      "city" => depot.city,
      "address" => depot.address,
      "latitude" => depot.latitude.to_s,
      "longitude" => depot.longitude.to_s,
      "accepts_new_members" => depot.accepts_new_members,
      "is_established" => depot.is_established,
      "description" => depot.description,
      "updated_at" => depot.updated_at.as_json,
      "vegetable_products" => nil,
      "animal_products" => nil,
      "beverages" => nil,
      "related_places_count"=> depot.related_places_count,
      "type" => depot.type
    }
    methods = authorized ? [:name, :email, :phone] : [:name]
    response = response.merge({
      "ownerships" => depot.ownerships.map{|o| {ownership: o.as_json(except: [:id, :place_id], methods: methods)}}.as_json
    })
    response
  end

  def expected_show_response_for(depot, authorized)
    response = expected_index_response_for(depot, authorized)
    response = response.merge(
      { "places" => depot.places,
        "delivery_days" => depot.delivery_days
    })
    methods = authorized ? [:name, :email, :phone] : [:name]
    response = response.merge({
      "ownerships" => depot.ownerships.map{|o| {ownership: o.as_json(except: [:id, :place_id], methods: methods)}}.as_json
    })
    response
  end

  shared_examples_for "a non-existing depot" do
    it "returns an error" do
      non_existing_id = "99999"
      get "#{url}/depots/#{non_existing_id}"
      expect_record_not_found_failure(last_response, "Depot", non_existing_id)
    end
  end

  shared_examples_for "a readable depot" do
    it "returns a depot" do
      get "#{url}/depots/#{@depot1.id}"

      expect(last_response.status).to eq(200)
      response = JSON.parse(last_response.body)
      expect(response).to eq(expected_show_response_for(@depot1, false))
    end

    it "returns all depots" do
      get "#{url}/depots"

      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response.size).to eq(3)
      expect(response[0]).to eq(expected_index_response_for(@depot1, false))
      expect(response[1]).to eq(expected_index_response_for(@depot2, false))
      expect(response[2]).to eq(expected_index_response_for(@orphan_depot, false))
    end
  end

  shared_examples_for "a readable depot for an authorized user" do
    it "returns a depot including private data" do
      get "#{url}/depots/#{@depot1.id}"

      expect(last_response.status).to eq(200)
      response = JSON.parse(last_response.body)
      expect(response).to eq(expected_show_response_for(@depot1, true))
    end

    it "returns all depots including private data for the owned depot" do
      get "#{url}/depots"

      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response.size).to eq(3)
      expect(response[0]).to eq(expected_index_response_for(@depot1, true))
      expect(response[1]).to eq(expected_index_response_for(@depot2, false))
      expect(response[2]).to eq(expected_index_response_for(@orphan_depot, true))
    end
  end

  shared_examples_for "a readable depot for an admin user" do
    it "returns a depot including private data" do
      get "#{url}/depots/#{@depot1.id}"

      expect(last_response.status).to eq(200)
      response = JSON.parse(last_response.body)
      expect(response).to eq(expected_show_response_for(@depot1, true))
    end

    it "returns all depots including private data for all depots" do
      get "#{url}/depots"

      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response.size).to eq(3)
      expect(response[0]).to eq(expected_index_response_for(@depot1, true))
      expect(response[1]).to eq(expected_index_response_for(@depot2, true))
      expect(response[2]).to eq(expected_index_response_for(@orphan_depot, true))
    end
  end

  shared_examples_for "an editable depot" do
    it "updates the depot"  do
      params = {}
      params[:depot] = {name: "New Name"}
      params[:places] = nil
      put "#{url}/depots/#{@depot1.id}", params
      expect(last_response.status).to eq(204)
      expect(@depot1.reload.name).to eq("New Name")
    end

    it "deletes the depot" do
      expect {
        params = {}
        delete "#{url}/depots/#{@depot1.id}", params
      }.to change { Depot.count }.by(-1)
      expect(last_response.status).to eq(204)
    end
  end

  shared_examples_for "a non-editable depot" do
    it "does not update the depot"  do
      params = {}
      params[:depot] = {name: "New Name"}

      put "#{url}/depots/#{@depot2.id}", params
      expect_unauthorized_failure(last_response)
      expect(@depot2.reload.name).not_to eq("New Name")
    end

    it "does not delete the depot" do
      params = {}
      expect {
        delete "#{url}/depots/#{@depot2.id}", params
      }.not_to change { Depot.count }
      expect_unauthorized_failure(last_response)
    end
  end

  context "as an anonymous user" do
    it_behaves_like "a non-existing depot"
    it_behaves_like "a non-editable depot"
    it_behaves_like "a readable depot"

    it "does not add a new depot" do
      expect {
        params = {}
        params[:depot] = FactoryGirl.accessible_attributes_for(:depot, name: "depot3")
        params[:places] = nil
        post "#{url}/depots", params
      }.not_to change { Depot.count }
      expect_unauthorized_failure(last_response)
    end

  end

  context "as a user with role 'user'" do
    let(:user) { create(:user) }

    before do
      api_sign_in(user)
      @depot1.users = [user]
      @depot1.save!
      @depot2.users = [another_user]
      @depot2.save!
    end

    it_behaves_like "a readable depot for an authorized user"

    it "adds a new depot that is owned by the user" do
      expect {
        params = {}
        params[:depot] = FactoryGirl.accessible_attributes_for(:depot, name: "depot3")
        params[:places] = nil
        post "#{url}/depots", params
      }.to change { Depot.count }.by(1)
      expect(last_response.status).to eq(201)
      expect(Depot.last.name).to eq("depot3")
      expect(Depot.last.users).to eq([user])
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

    before do
      api_sign_in(user)
      @depot1.users = [user]
      @depot1.save!
      @depot2.users = [another_user]
      @depot2.save!
    end

    it_behaves_like "a readable depot for an admin user"
    it_behaves_like "an editable depot"

    it "adds a new depot that is owned by the user" do
      expect {
        params = {}
        params[:depot] = FactoryGirl.accessible_attributes_for(:depot, name: "depot3")
        params[:places] = nil

        post "#{url}/depots", params
      }.to change { Depot.count }.by(1)
      expect(last_response.status).to eq(201)
      expect(Depot.last.users).to eq([user])
    end
  end

  context "as a user with role 'admin' not the owner" do
    let(:admin) { create(:admin) }
    let(:user) { create(:user) }

    before do
      api_sign_in(admin)
      @depot1.users = [user]
      @depot1.save!
      @depot2.users = [another_user]
      @depot2.save!
    end

    it_behaves_like "a readable depot for an admin user"
  end

  context "as a user with role 'superadmin' not the owner" do
    let(:superadmin) { create(:superadmin) }
    let(:user) { create(:user) }

    before do
      api_sign_in(superadmin)
      @depot1.users = [user]
      @depot1.save!
      @depot2.users = [another_user]
      @depot2.save!
    end

    it_behaves_like "a readable depot for an admin user"
  end

end
