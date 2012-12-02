require 'spec_helper'

describe FarmsController do

  before do
    @user = create(:user)
    @farm = create(:farm)
    sign_in @user
  end

  describe "#index" do
    before { get :index }

    it "renders the #index view" do
      expect(response).to render_template :index
    end

    it "assigns the farms as @farms" do
      expect(assigns(:farms)).to eq([@farm])
    end
  end

end
