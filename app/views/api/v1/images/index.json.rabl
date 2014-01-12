collection @images

node(:url) { |p| p.file.large.url }
node(:thumbnail_url) { |p| p.file.thumbnail.url }
attribute :description
