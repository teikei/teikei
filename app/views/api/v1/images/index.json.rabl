collection @images

node(:url) { |p| p.file.url }
node(:thumbnail_url) { |p| p.file.thumbnail.url }
attribute :description
