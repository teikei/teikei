class ApplicationController < ActionController::Base
  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_path, :alert => exception.message
  end

  layout :choose_layout

  # Method name must match with `config.authentication_method`
  # in `config/initializers/active_admin.rb`
  def authenticate_active_admin_user!
    authenticate_user!
    unless current_user.has_role? :superadmin
      flash[:alert] = t("errors.authorization_denied")
      redirect_to root_path
    end
  end

  protected

  def choose_layout
    if devise_controller?
      'static'
    else
      'application'
    end
  end
end
