class Api::V1::FarmsController < Api::V1::BaseController

	load_and_authorize_resource
	rescue_from CanCan::AccessDenied do |exception|
		redirect_to farms_path, alert: exception.message
	end

	def index
		respond_with(@farms)
	end
end
