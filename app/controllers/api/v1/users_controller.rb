class Api::V1::UsersController < Api::V1::BaseController
  skip_authorize_resource only: :create

  respond_to :json, only: [:create, :show]
end
