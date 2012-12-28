class Api::V1::FarmsController < Api::V1::BaseController
	def index
		respond_with(Farm.all)
	end
end
