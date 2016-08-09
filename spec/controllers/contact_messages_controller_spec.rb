require 'rails_helper'

describe ContactMessagesController, type: :controller do
  describe '#new' do
    it 'renders the #new view' do
      get :new
      expect(response).to render_template :new
    end
  end

  describe '#create' do
    context 'when sending no form data' do
      it "renders the 'new' template for the invalid contact_message" do
        post :create, contact_message: nil
        expect(assigns(:contact_message)).not_to be_valid
        expect(response).to render_template :new
      end
    end

    context 'when sending valid contact form data' do
      it 'renders the index page and displays a success message' do
        expect do
          params = {}
          params[:contact_message] = FactoryGirl.attributes_for(:valid_contact_message)
          post :create, params
        end.to change { ActionMailer::Base.deliveries.count }.by(1)
        expect(assigns(:contact_message)).to be_valid
        expect(flash[:notice]).to eq(I18n.t('.controllers.messages.success.email_sent'))
        expect(response).to redirect_to root_path
      end
    end

    context 'when sending invalid contact form data' do
      it 'renders the index page and displays an error message' do
        post :create, contact_message: FactoryGirl.attributes_for(:invalid_contact_message)
        expect(assigns(:contact_message)).not_to be_valid
        expect(response).to render_template :new
      end
    end
  end
end
