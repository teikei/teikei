require 'spec_helper'

describe MessagesController do

  describe "#index" do
    it "renders the #index view" do
      get :index
      expect(response).to render_template :index
    end
  end

  describe "#create" do

    context "when sending no form data" do
      it "redirects to the root path and displays an error message" do
        post :create, params: nil
        expect(response).to redirect_to root_path
        expect(flash[:notice]).to eq(I18n.t(".controllers.messages.errors.missing_form_data"))
      end
    end

    context "when sending valid contact form data" do
      it "renders the index page and displays a success message" do
        post :create, contact_form: FactoryGirl.attributes_for(:valid_contact_message)
        expect(response).to render_template :index
        expect(flash[:notice]).to eq(I18n.t(".controllers.messages.success.email_sent"))
      end
    end

    context "when sending invalid contact form data" do
      it "renders the index page and displays an error message" do
        post :create, contact_form: FactoryGirl.attributes_for(:invalid_contact_message)
        expect(response).to render_template :index
        expect(flash[:notice]).to eq(I18n.t(".controllers.messages.errors.email_not_sent"))
      end
    end

    context "when sending valid place form data" do
      it "renders the index page and displays a success message" do
        pending "Fix recipient address."
        place = create(:place)
        post :create, place_form: FactoryGirl.attributes_for(:valid_place_message)
        expect(response).to redirect_to root_path
        expect(flash[:notice]).to eq(I18n.t(".controllers.messages.success.email_sent_to", contact_name: place.contact_name))
      end
    end

    context "when sending invalid place form data" do
      it "renders the index page and displays an error message" do
        place = create(:place)
        post :create, place_form: FactoryGirl.attributes_for(:invalid_place_message)
        expect(response).to  redirect_to root_path
        expect(flash[:notice]).to eq(I18n.t(".controllers.messages.errors.email_not_sent_to", contact_name: place.contact_name))
      end
    end

  end

end
