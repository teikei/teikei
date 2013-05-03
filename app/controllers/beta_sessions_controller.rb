class BetaSessionsController < Devise::SessionsController
  respond_to :json, :html

  def create
    if params[:user].blank?
      respond_to do |format|
        format.html { super }
        format.json do
          render json: { error: "missing user parameter" }, status: 422
        end
      end
    else
      resource = User.find_for_database_authentication(email: params[:user][:email])
      if resource && resource.valid_password?(params[:user][:password])
        resource.reset_authentication_token!
        respond_to do |format|
          format.html do
            cookies[:auth_token] = resource.authentication_token
            cookies[:username] = resource.name
            super
          end
          format.json { render json: { auth_token: resource.authentication_token, user: resource}, status: 201 }
        end
      else
        respond_to do |format|
          format.html { super }
          format.json { render json: { error: "Error with your login or password"}, status: 401 }
        end
      end
    end
  end

  def destroy
    resource = User.find_for_database_authentication(id:  params[:id])
    if resource
      resource.authentication_token = nil
      resource.save
      sign_out(current_user)
      respond_to do |format|
        format.html { super }
        format.json { render json: { success: true }, status: 204 }
      end
    else
      respond_to do |format|
        format.html { super }
        format.json { render json: { error: "User not recognized." }, status: 404 }
      end
    end
  end
end
