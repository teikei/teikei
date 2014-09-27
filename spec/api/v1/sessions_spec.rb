require 'spec_helper'

describe '/api/v1/sessions' do
  let(:url) { '/api/v1' }
  let(:user) { create(:user) }

  it 'creates a new session when the request contains valid credentials' do
    pending
    api_sign_in(user)
    expect(last_response.status).to eq(200)

    response_user = JSON.parse(last_response.body)
    expect(response_user).not_to be_nil
    expect(response_user['name']).to eq(user.name)
    expect(response_user['email']).to eq(user.email)
    expect(response_user['id']).not_to be_nil
    expect(response_user['id']).to be > 0
  end

  it 'does not create a new session when the request contains invalid credentials' do
    pending
    @user_with_wrong_credentials = build(:user, password: 'wrongpassword')
    api_sign_in(@user_with_wrong_credentials)
    expect(last_response.status).to eq(401)

    response_error = JSON.parse(last_response.body)['error']
    expect(response_error).to eq(I18n.t('.controllers.sessions.errors.access_denied'))

    response_user = JSON.parse(last_response.body)['user']
    expect(response_user).to be_nil
  end

  it 'destroys a session and invalidates the authentication token' do
    pending
    api_sign_out
    expect(last_response.status).to eq(200)
  end

end
