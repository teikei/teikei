json.(@farm,
      :id, :name, :city, :latitude, :longitude,
      :accepts_new_members, :description, :url,
      :related_places_count,
      :vegetable_products, :animal_products, :beverages,
      :type, :updated_at,
      :founded_at_year, :founded_at_month, :maximum_members,
      :additional_product_information, :participation,
      :acts_ecological, :economical_behavior,
      :contact_function, :url)
json.image do |image|
  if @farm.image
    json.(@farm.image, :description)
    json.url @farm.image.file.large.url
    json.thumbnail_url @farm.image.file.thumbnail.url
  end
end
json.places do |places|
  places.array!(@farm.places) do |place|
    json.(place, :id, :name, :city, :address, :type, :vegetable_products, :animal_products, :beverages)
  end
end
