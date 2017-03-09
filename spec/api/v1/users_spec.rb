require 'rails_helper'

describe '/api/v1/users', type: :request do
  let(:url) { '/api/v1' }
  let(:user) { create(:user) }

  context 'as an anonymous user' do
    let(:token) { nil }

    it 'responds with an unauthorized error' do
      get "#{url}/users/#{user.id}", auth_token: token
      expect_unauthorized_failure(last_response)
    end

    it 'adds a new user' do
      expect {
        params = {}
        params[:user] = FactoryGirl.attributes_for(:user)
        post "#{url}/users", params
        follow_redirect!
      }.to change { User.count }
      expect(last_response.status).to eq(200)
    end

  end

end
