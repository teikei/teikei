class Api::V1::PlacesController < Api::V1::BaseController
  actions :index

  def index
    respond_to do |format|
      format.json {
        response_hash = Place.response_hash_for_places(@places)
        render :json => response_hash.to_json
      }
    end
  end
end
