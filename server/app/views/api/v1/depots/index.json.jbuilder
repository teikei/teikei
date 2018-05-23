json.array! @depots do |place|
  json.(place,
        :id, :name, :city, :latitude, :longitude,
        :accepts_new_members, :description,
        :related_places_count,
        :vegetable_products, :animal_products, :beverages,
        :type, :updated_at)
end


