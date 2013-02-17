class Api::V1::FarmsController < Api::V1::BaseController

  def update
    if params[:places]
      @farm.places.each { |p| @farm.places.delete(p.place) }
      @farm.save!
      @farm.reload
      @farm.places = Place.find(params[:places]).map(&:place)
    end
    update!
  end

  def create
    @farm.user = current_user if current_user
    create!
  end

end
