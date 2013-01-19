class Api::V1::DepotsController < Api::V1::BaseController

  load_and_authorize_resource
  rescue_from CanCan::AccessDenied do |exception|
    redirect_to depots_path, alert: exception.message
  end

  def index
    respond_with(@depots)
  end

  def show
    respond_with(@depot)
  end
end
