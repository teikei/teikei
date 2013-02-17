class Api::V1::DepotsController < Api::V1::BaseController

  def update
    if params[:places]
      @depot.places.each { |p| @depot.places.delete(p.place) }
      @depot.save!
      @depot.reload
      @depot.places = Place.find(params[:places]).map(&:place)
    end
    update!
  end

  def create
    @depot.user = current_user if current_user
    create!
  end

end
