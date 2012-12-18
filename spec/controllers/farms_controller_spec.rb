require 'spec_helper'

describe FarmsController do

  before do
    @user = create(:user)
  end

  describe "#index" do

    before do
      @farm = create(:farm)
    end

    context "HTML" do
      it "renders the #index view" do
        get :index
        expect(response).to render_template :index
      end

      it "assigns the farms as @farms" do
        get :index
        expect(assigns(:farms)).to eq [@farm]
      end
    end

    context "JSON" do
      it "returns an array of all farms" do
        get :index, format: :json
        expect(response.body).to eq [@farm].to_json
      end
    end
  end

  describe "#show" do

    before do
      @farm = create(:farm)
    end

    context "HTML" do
      it "renders the #show view" do
        get :show, id: @farm.id
        expect(response).to render_template :show
      end

      it "assigns the requested farm as @farm" do
        get :show, id: @farm.id
        expect(assigns(:farm)).to eq @farm
      end
    end

    context "JSON" do
      it "returns the requested farm" do
        get :show, id: @farm.id, format: :json
        expect(response.body).to eq @farm.to_json
      end
    end
  end

  describe "#create" do
    context "when signed in" do
      before do
        sign_in @user
        @farm_attributes = attributes_for(:farm)
      end

      it "stores the farm in the database" do
        expect { post :create, farm: @farm_attributes }.to change(Farm, :count).by(1)
      end

      context "HTML" do
        it "redirects to the new farm" do
          post :create, farm: @farm_attributes
          expect(response).to redirect_to Farm.last
        end
      end

      context "JSON" do
        it "responds with the new farm and HTTP status 201 (created)" do
          post :create, farm: @farm_attributes, format: :json
          body = JSON.parse(response.body)
          expect(body["id"]).not_to be_nil
          expect(response.status).to eq 201
        end
      end
    end

    context "when not signed in" do
      before do
        # TODO shouldn't use capybara here
        visit '/users/sign_out'
      end

      it "does not store the farm in the database" do
        expect { post :create, farm: attributes_for(:farm) }.not_to change(Farm, :count)
      end

      context "HTML" do
        it "redirects to the new farm" do
          post :create, farm: attributes_for(:farm)
          expect(response).to redirect_to Farm.last
        end
      end

      context "JSON" do
        it "responds with HTTP status 401 (unauthorized)" do
          expect(response.source).to be_empty
          expect(response.status).to eq 401
        end
      end
    end
  end

  # describe "#edit" do
  #   it "responds with a redirect" do
  #     newfarm = attributes_for(:farm)
  #     get :edit, id: @farm.id, format: :json
  #     # TODO how to test that no JSON was returned?
  #     # expect(response.body).to be_empty
  #     expect(response.status).to eq 302 # redirect
  #   end
  # end

  # describe "#create" do
  #   it "responds with a redirect" do
  #     newfarm = attributes_for(:farm)
  #     post :create, farm: newfarm, format: :json
  #     # TODO how to test that no JSON was returned?
  #     # expect(response.body).to be_empty
  #     expect(response.status).to eq 302 # redirect
  #   end
  # end
end
