class SessionsController < Devise::SessionsController

  def create
    resource = warden.authenticate!(scope: resource_name, recall: "#{controller_path}#failure")
    sign_in(resource_name, resource)
    return render json: resource
  end

  def failure
    return render json: { success: false, errors: ['Login information is incorrect, please try again'] }
  end
end