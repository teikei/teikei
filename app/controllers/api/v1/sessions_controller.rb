class Api::V1::SessionsController < ApplicationController
  respond_to :json

  def create
    if params[:user].blank?
      render json: {error: "missing user parameter"}, status: 422
      return
    end

    resource = User.find_for_database_authentication(email: params[:user][:email])
    if resource && resource.valid_password?(params[:user][:password])
      sign_in(:user, resource)
      resource.reset_authentication_token!
      render json: {auth_token: resource.authentication_token, user: resource}, status: 201
    else
      render json: {error: "Error with your login or password"}, status: 401
    end
  end

  def destroy
    resource = User.find_for_database_authentication(id:  params[:id])
    if resource
      resource.authentication_token = nil
      resource.save
      render json: {success: true}, status: 204
    else
      render json: {error: "User not recognized."}, status: 404
    end
  end
end
