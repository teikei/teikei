require 'spec_helper'

describe UsersController do

  before do
    @user = create(:user)
    sign_in @user
  end

  describe "#show" do
    it "renders the #show view" do
      get :show, id: @user.id
      expect(response).to render_template :show
    end

    it "assigns the user as @user" do
      get :show, id: @user.id
      expect(assigns(:user)).to eq(@user)
    end
  end

end
