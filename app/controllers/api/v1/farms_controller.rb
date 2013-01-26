class Api::V1::FarmsController < Api::V1::BaseController

  def index
    respond_to do |format|
      format.json {
        render :json => @farms.to_json
      }
    end
  end

  def create
    @farm.user = current_user if current_user
    create!
  end

end
