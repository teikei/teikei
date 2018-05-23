json.array! @initiatives do |place|
  json.(place,
      :id, :name, :city, :address, :latitude, :longitude,
      :description, :type, :updated_at)
end


