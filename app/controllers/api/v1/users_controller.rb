class Api::V1::UsersController < Api::V1::BaseController
  skip_authorize_resource

  respond_to :json, only: [:create]
end
