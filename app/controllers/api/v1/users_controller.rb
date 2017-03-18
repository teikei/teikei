class Api::V1::UsersController < Api::V1::BaseController
  skip_authorize_resource only: [:create, :me]

  respond_to :json, only: [:create, :show]

  def me
      render json: { user: current_user, signed_in: signed_in? }
  end
end
