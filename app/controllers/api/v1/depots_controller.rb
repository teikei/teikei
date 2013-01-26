class Api::V1::DepotsController < Api::V1::BaseController

  def index
    respond_to do |format|
      format.json {
        response_hash = Depot.response_hash_for_depots(@depots)
        render :json => response_hash.to_json
      }
    end
  end

  def create
    @depot.user = current_user if current_user
    create!
  end

end
