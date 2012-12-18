class FarmsController < InheritedResources::Base
  authorize_resource
  rescue_from CanCan::AccessDenied do |exception|
    redirect_to farms_path, alert: exception.message
  end

  respond_to :html, :json


end
