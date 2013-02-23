class Api::V1::DepotsController < Api::V1::BaseController

  def update
    if params[:places]
      @depot.places = Place.find(params[:places])
    end
    update!
  end

  def create
    @depot.user = current_user if current_user
    create!
  end

end
