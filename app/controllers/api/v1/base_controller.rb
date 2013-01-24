class Api::V1::BaseController < InheritedResources::Base
  load_and_authorize_resource

  respond_to :json, except: [:new, :edit]

  rescue_from CanCan::AccessDenied do |exception|
    render json: exception.message, status: 401
  end
end
