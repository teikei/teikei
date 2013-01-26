class Api::V1::SessionsController < Devise::SessionsController
  respond_to :json

  def create
    resource = warden.authenticate!(:scope => resource_name, :recall => :login_failed)
    resource.reset_authentication_token!
    respond_with(resource)
  end

  def destroy
    render json: "success".to_json
  end
end
