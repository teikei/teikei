class Api::V1::FarmsController < Api::V1::BaseController

  after_filter :link_image_to_farm, only: [:create, :update]

  def index
    @farms = Farm.all.includes(:places).includes(:reverse_places).includes(:users)
  end

  def update
    expire_fragment('places_index')
    update!
  end

  def create
    @farm.users = [current_user] if current_user
    expire_fragment('places_index')
    create!
    User.with_role(:admin).each do |admin|
      AppMailer.admin_notification(@farm, admin).deliver_now
    end
  end

  private

  def link_image_to_farm
    if params[:image] && params[:image][:id]
      image = Image.find(params[:image][:id])
      @farm.image = image
      @farm.save
    end
  end

end
