require 'rails_helper'

describe HomeController, type: :controller do

  describe "#index" do
    it "renders the #index view" do
      get :index
      expect(response).to render_template :index
    end
  end

end
