json.cache! ['places_index', @places] do
  json.array! @places do |place|
    json.(place,
          :id, :name, :city, :latitude, :longitude,
          :related_places_count,
          :vegetable_products, :animal_products, :beverages, :type)
  end
end


