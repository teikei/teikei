require 'spec_helper'

describe "/api/v1/sessions" do
  let(:url) { "/api/v1" }

  before do
    @user = create(:user)
  end

  it "creates a new session when the request contains valid credentials"  do
    api_sign_in(url, @user)
    expect(last_response.status).to eq(201)

    response_user = JSON.parse(last_response.body)["user"]
    expect(response_user).not_to be_nil
    expect(response_user["name"]).to eq(@user.name)
    expect(response_user["email"]).to eq(@user.email)
    expect(response_user["id"]).not_to be_nil
    expect(response_user["id"]).to be > 0
  end

  it "does not create a new session when the request contains invalid credentials"  do
    @user_with_wrong_credentials = build(:user, password: "wrongpassword")
    api_sign_in(url, @user_with_wrong_credentials)
    expect(last_response.status).to eq(401)
    expect(User.last.authentication_token).to be_nil

    response_error = JSON.parse(last_response.body)["error"]
    expect(response_error).to eq(I18n.t(".controllers.sessions.errors.access_denied"))

    response_user = JSON.parse(last_response.body)["user"]
    expect(response_user).to be_nil
  end

  it "destroys a session and invalidates the authentication token" do
    api_sign_out(url, @user)
    # TODO status 200? why not 204?
    expect(last_response.status).to eq(200)
    expect(User.last.authentication_token).to be_nil
  end

end
