class Api::V1::FarmsController < Api::V1::BaseController
  def update
    update!
  end

  def create
    @farm.user = current_user if current_user
    create!
  end
end
