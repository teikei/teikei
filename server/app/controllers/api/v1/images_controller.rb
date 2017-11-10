class Api::V1::ImagesController < Api::V1::BaseController
  def create
    @image = Image.new(file: params[:file])
    @image.save!
    render(json: @image.to_fileupload, content_type: 'text/plain')
  end
end
