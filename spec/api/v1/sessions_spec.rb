require 'spec_helper'

describe "/api/v1/sessions" do
  let(:url) { "/api/v1" }

  before do
    @user = create(:user)
  end

  it "creates a new session when the request contains valid credentials"  do
    params = {}
    user = {email: @user.email, password: @user.password}
    params[:user] = user
    post "#{url}/sessions.json", params
    expect(last_response.status).to eq(201)
  end

  it "does not create a new session when the request contains invalid credentials"  do
    params = {}
    user = {email: @user.email, password: "wrongpassword"}
    params[:user] = user
    post "#{url}/sessions.json", params
    expect(last_response.status).to eq(401)
  end

  it "destroys a session and invalidates the authentication token" do
    delete "#{url}/sessions/#{@user.id}.json"
    expect(last_response.status).to eq(204)
    expect(User.last.authentication_token).to be_nil
  end

end
