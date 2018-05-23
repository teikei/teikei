json.(@depot,
      :id, :name, :city, :address, :latitude, :longitude,
      :accepts_new_members, :description, :url,
      :related_places_count,
      :vegetable_products, :animal_products, :beverages,
      :type, :updated_at,
      :delivery_days)
json.places do |places|
  places.array!(@depot.places) do |place|
    json.(place, :id, :name, :city, :address, :type, :vegetable_products, :animal_products, :beverages)
  end
end
