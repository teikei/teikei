class Api::V1::RegistrationsController < Devise::RegistrationsController


  def create
    params[:user][:origin] = extract_origin(request)
    super
  end

  private

  def extract_origin(request)
    if request.headers['HTTP_ORIGIN']
      # cors request
      request.headers['HTTP_ORIGIN']
    else
      request.base_url
    end
  end

end