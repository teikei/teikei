class FarmsController < InheritedResources::Base
  load_and_authorize_resource

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to farms_path, alert: exception.message
  end

  respond_to :html, :json

  def create
    @farm.user = current_user if current_user
    create!
  end
end
