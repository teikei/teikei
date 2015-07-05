json.array! @images do |image|
  json.(image, :description)
  json.url image.file.large.url
  json.thumbnail_url image.file.thumbnail.url
end

