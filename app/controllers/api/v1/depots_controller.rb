class Api::V1::DepotsController < Api::V1::BaseController
  def update
    assign_places(@depot)
    update!
  end

  def create
    @depot.user = current_user if current_user
    create!
  end
end
