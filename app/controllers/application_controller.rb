class ApplicationController < ActionController::Base

  before_filter :prepare_nav
  before_filter :update_sanitized_params, if: :devise_controller?

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_path, :alert => exception.message
  end

  respond_to :html, :json

  def prepare_nav
    @nav_items = [
      { title: 'nav.start_page',  style: 'page-nav-home',   path: '/'      },
      { title: 'nav.map',         style: 'page-nav-map',    path: '/map'   },
     #{ title: 'nav.faq',         style: 'page-nav-faq',    path: '/faq'   },
      { title: 'nav.about',       style: 'page-nav-about',  path: '/about' },
    ]

    @nav_items.each do |ni|
      if ni[:path] == request.path
        ni[:style] += " active"
      end
    end
  end

  def update_sanitized_params
    devise_parameter_sanitizer.for(:sign_up) {|u| u.permit(:email, :password, :password_confirmation, :name, :phone)}
    devise_parameter_sanitizer.for(:account_update) { |u|
      u.permit(:email, :password, :password_confirmation, :current_password, :name, :phone)
    }
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
end
