class ApplicationController < ActionController::Base

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_path, :alert => exception.message
  end

  def authenticate_active_admin_user!
    authenticate_user!
    unless current_user.has_role? :superadmin
      flash[:alert] = "Unauthorized Access!"
      redirect_to root_path
    end
  end

end
