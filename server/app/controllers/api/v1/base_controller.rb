class Api::V1::BaseController < InheritedResources::Base
  load_and_authorize_resource

  respond_to :json, except: [:new, :edit]

  rescue_from StandardError do |exception|
    render json: { error: exception.message }, status: 500
  end

  rescue_from ActiveRecord::RecordNotFound do |exception|
    render json: { error: exception.message }, status: 404
  end

  rescue_from CanCan::AccessDenied do |exception|
    exception.default_message = I18n.t('cancan.errors.unauthorized')
    render json: { error: exception.message }, status: 401
  end

end
