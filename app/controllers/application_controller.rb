class ApplicationController < ActionController::Base
  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_path, :alert => exception.message
  end

  layout :choose_layout

  def auth_token
    request.headers['auth_token']
  end

  # Method name must match with `config.authentication_method`
  # in `config/initializers/active_admin.rb`
  def authenticate_active_admin_user!
    authenticate_user!
    unless current_user.has_role? :superadmin
      flash[:alert] = t("errors.authorization_denied")
      redirect_to root_path
    end
  end

  # Path for redirection after user sign-in, depending on role.
  # Works for Devise sign-in form at least.
  def after_sign_in_path_for(user)
    (user.has_role? :superadmin) ? admin_dashboard_path : root_path
  end

  protected

  def choose_layout
    if devise_controller?
      "static"
    else
      "application"
    end
  end
end
