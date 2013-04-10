class UsersController < InheritedResources::Base
  authorize_resource
  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_path, alert: exception.message
  end

  respond_to :html, :json
  actions :index, :show, :update, :destroy
end
