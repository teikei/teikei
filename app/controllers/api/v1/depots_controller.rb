class Api::V1::DepotsController < Api::V1::BaseController

  def index
    respond_to do |format|
      format.json {
        render :json => @depots.to_json
      }
    end
  end

  def create
    @depot.user = current_user if current_user
    create!
  end

end
