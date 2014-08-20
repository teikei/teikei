class ApplicationController < ActionController::Base

  before_filter :prepare_nav

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_path, :alert => exception.message
  end

  def auth_token
    request.headers['auth_token']
  end

  def prepare_nav
    @nav_items = [
      { title: 'nav.start_page',  style: 'page-nav-home',   path: '/'      },
      { title: 'nav.map',         style: 'page-nav-map',    path: '/map'   },
      { title: 'nav.faq',         style: 'page-nav-faq',    path: '/faq'   },
      { title: 'nav.about',       style: 'page-nav-about',  path: '/about' },
    ]

    @nav_items.each do |ni|
      if ni[:path] == request.env['REQUEST_PATH']
        ni[:style] += " active"
      end
    end
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

end
