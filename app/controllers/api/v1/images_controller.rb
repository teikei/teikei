class Api::V1::ImagesController < Api::V1::BaseController
  def create
    @image = Image.new(file: params[:file])
    create!
  end
end
