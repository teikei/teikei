class Api::V1::PlacesController < Api::V1::BaseController
  actions :index

  def index
    respond_to do |format|
      format.json {
        render :json => @places.to_json
      }
    end
  end
end
