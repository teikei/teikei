class Image < ActiveRecord::Base
  include Rails.application.routes.url_helpers

  mount_uploader :file, ImageUploader
  attr_accessible :description, :file
  belongs_to :place

  def to_fileupload
    {
      id: id,
      url: file.large.url,
      thumbnail_url: file.thumbnail.url,
      description: description
    }
  end
end
