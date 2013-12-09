class Api::V1::FarmsController < Api::V1::BaseController

  after_filter :link_image_to_farm, only: [:create, :update]

  def update
    update!
  end

  def create
    @farm.user = current_user if current_user
    create!
  end

  private

  def link_image_to_farm
    if params[:image]
      image = Image.find(params[:image][:id])
      @farm.image = image
      @farm.save
    end
  end

end
