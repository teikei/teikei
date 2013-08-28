require 'spec_helper'

describe "/api/v1/farms" do
  let(:url) { "/api/v1" }
  let(:another_user) { create(:user, name: "Another User") }

  before do
    @farm1 = create(:farm, name: "farm 1").reload
    @farm2 = create(:farm, name: "farm 2").reload
    @orphan_farm = create(:orphan_farm, name: "Orphan farm").reload
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
      "contact_phone" => farm.contact_phone,
      "updated_at" => farm.updated_at.to_json.gsub("\"", ''),
      "founded_at_year" => farm.founded_at_year,
      "founded_at_month" => farm.founded_at_month,
      "maximum_members" => farm.maximum_members,
      "products" => farm.products,
      "farming_standard" => farm.farming_standard,
      "participation" => farm.participation,
      "type" => farm.type,
      "user_id" => farm.user_id }
  end

  def expected_authorized_index_response_for(farm)
    expected_index_response_for(farm).merge(
      { "contact_email" => farm.contact_email }
    )
  end

  def expected_show_response_for(farm)
    expected_index_response_for(farm).merge(
      { "places" => farm.places }
    )
  end

  def expected_authorized_show_response_for(farm)
    expected_authorized_index_response_for(farm).merge(
      { "places" => farm.places }
    )
  end

  shared_examples_for "a non-existing farm" do
    it "returns an error" do
      non_existing_id = "99999"
      get "#{url}/farms/#{non_existing_id}", auth_token: token
      expect_record_not_found_failure(last_response, "Farm", non_existing_id)
    end
  end

  shared_examples_for "a readable farm" do
    it "returns a farm" do
      get "#{url}/farms/#{@farm1.id}", auth_token: token

      expect(last_response.status).to eq(200)
      response = JSON.parse(last_response.body)
      expect(response).to eq(expected_show_response_for(@farm1))
    end

    it "returns all farms" do
      get "#{url}/farms", auth_token: token

      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response.size).to eq(3)
      expect(response[0]).to eq(expected_index_response_for(@farm1))
      expect(response[1]).to eq(expected_index_response_for(@farm2))
      expect(response[2]).to eq(expected_index_response_for(@orphan_farm))
    end
  end

  shared_examples_for "a readable farm for an authorized user" do
    it "returns a farm including private data" do
      get "#{url}/farms/#{@farm1.id}", auth_token: token

      expect(last_response.status).to eq(200)
      response = JSON.parse(last_response.body)
      expect(response).to eq(expected_authorized_show_response_for(@farm1))
    end

    it "returns all farms including private data for the owned farm" do
      get "#{url}/farms", auth_token: token

      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response.size).to eq(3)
      expect(response[0]).to eq(expected_authorized_index_response_for(@farm1))
      expect(response[1]).to eq(expected_index_response_for(@farm2))
      expect(response[2]).to eq(expected_index_response_for(@orphan_farm))
    end
  end

  shared_examples_for "a readable farm for an admin user" do
    it "returns a farm including private data" do
      get "#{url}/farms/#{@farm1.id}", auth_token: token

      expect(last_response.status).to eq(200)
      response = JSON.parse(last_response.body)
      expect(response).to eq(expected_authorized_show_response_for(@farm1))
    end

    it "returns all farms including private data for all farms" do
      get "#{url}/farms", auth_token: token

      expect(last_response).to be_ok
      response = JSON.parse(last_response.body)
      expect(response.size).to eq(3)
      expect(response[0]).to eq(expected_authorized_index_response_for(@farm1))
      expect(response[1]).to eq(expected_authorized_index_response_for(@farm2))
      expect(response[2]).to eq(expected_authorized_index_response_for(@orphan_farm))
    end
  end

  shared_examples_for "an editable farm" do
    it "updates the farm"  do
      params = {}
      params[:farm] = {name: "New Name"}
      params[:auth_token] = token
      put "#{url}/farms/#{@farm1.id}", params
      expect(last_response.status).to eq(204)
      expect(@farm1.reload.name).to eq("New Name")
    end

    it "updates the places relationships of the farm (with ids as nested places)" do
      params = {}
      params[:places] = [@farm1.id, @farm2.id]
      params[:auth_token] = token
      put "#{url}/farms/#{@farm1.id}", params
      expect(last_response.status).to eq(204)
      expect(@farm1.places).to eq([@farm1, @farm2])
    end

    it "updates the places relationships of the farm (with full objects as nested places)" do
      params = {}
      params[:places] = [@farm1.as_json, @farm2.as_json]
      params[:auth_token] = token
      put "#{url}/farms/#{@farm1.id}", params
      expect(last_response.status).to eq(204)
      expect(@farm1.reload.places).to eq([@farm1, @farm2])
    end

    # special test for the current issue with replacing associations
    # with multiple_table_inheritance
    it "replaces an existing places relationship of the farm" do
      params = {}
      params[:places] = [@farm1.id, @farm2.id]
      params[:auth_token] = token
      put "#{url}/farms/#{@farm1.id}", params
      params = {}
      params[:places] = [@farm1.id, @farm2.id]
      params[:auth_token] = token
      put "#{url}/farms/#{@farm1.id}", params
      expect(last_response.status).to eq(204)
      expect(@farm1.reload.places).to eq([@farm1, @farm2])
    end

    it "deletes the farm" do
      expect {
        params = {}
        params[:auth_token] = token
        delete "#{url}/farms/#{@farm1.id}", params
      }.to change { Farm.count }.by(-1)
      expect(last_response.status).to eq(204)
    end
  end

  shared_examples_for "a non-editable farm" do
    it "does not update the farm"  do
      params = {}
      params[:farm] = {name: "New Name"}
      params[:auth_token] = token
      put "#{url}/farms/#{@farm2.id}", params
      expect_unauthorized_failure(last_response)
      expect(@farm2.reload.name).not_to eq("New Name")
    end

    it "does not delete the farm" do
      params = {}
      expect {
        params[:auth_token] = token
        delete "#{url}/farms/#{@farm2.id}", params
      }.not_to change { Farm.count }
      expect_unauthorized_failure(last_response)
    end
  end

  context "as an anonymous user" do
    let(:token) { nil }

    it_behaves_like "a non-existing farm"
    it_behaves_like "a readable farm"

    it "does not add a new farm" do
      expect {
        params = {}
        params[:farm] = FactoryGirl.accessible_attributes_for(:farm, name: "farm3")
        post "#{url}/farms", params
      }.not_to change { Farm.count }
      expect_unauthorized_failure(last_response)
    end

  end

  context "as a user with role 'user'" do
    let(:user) { create(:user) }
    let(:token) { user.authentication_token }

    before do
      api_sign_in(url, user)
      @farm1.user = user
      @farm1.save!
      @farm2.user = another_user
      @farm2.save!
    end

    it_behaves_like "a readable farm for an authorized user"

    it "adds a new farm that is owned by the user" do
      expect {
        params = {}
        params[:farm] = FactoryGirl.accessible_attributes_for(:farm, name: "farm3")
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
      @farm2.user = another_user
      @farm2.save!
    end

    it_behaves_like "a readable farm for an admin user"
    it_behaves_like "an editable farm"

    it "adds a new farm that is owned by the user" do
      expect {
        params = {}
        params[:farm] = FactoryGirl.accessible_attributes_for(:farm, name: "farm3")
        params[:auth_token] = token
        post "#{url}/farms", params
      }.to change { Farm.count }.by(1)
      expect(last_response.status).to eq(201)
      expect(Farm.last.user).to eq(user)
    end
  end

  context "as a user with role 'admin' not the owner" do
    let(:admin) { create(:admin) }
    let(:user) { create(:user) }
    let(:token) { admin.authentication_token }

    before do
      api_sign_in(url, admin)
      @farm1.user = user
      @farm1.save!
      @farm2.user = another_user
      @farm2.save!
    end

    it_behaves_like "a readable farm for an admin user"
  end

  context "as a user with role 'superadmin' not the owner" do
    let(:superadmin) { create(:superadmin) }
    let(:user) { create(:user) }
    let(:token) { superadmin.authentication_token }

    before do
      api_sign_in(url, superadmin)
      @farm1.user = user
      @farm1.save!
      @farm2.user = another_user
      @farm2.save!
    end

    it_behaves_like "a readable farm for an admin user"
  end

end
