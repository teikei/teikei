json.array! @farms do |place|
  json.(place,
        :id, :name, :city, :address, :latitude, :longitude,
        :accepts_new_members, :description,
        :related_places_count,
        :vegetable_products, :animal_products, :beverages,
        :type, :updated_at)
end


