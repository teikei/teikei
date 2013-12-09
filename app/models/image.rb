class Image < ActiveRecord::Base
  include Rails.application.routes.url_helpers

  mount_uploader :file, ImageUploader
  attr_accessible :description, :file
  belongs_to :place
end
