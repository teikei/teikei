json.(@farm,
      :id, :name, :city, :address, :latitude, :longitude,
      :accepts_new_members, :is_established, :description,
      :related_places_count,
      :vegetable_products, :animal_products, :beverages,
      :type, :updated_at,
      :founded_at_year, :founded_at_month, :maximum_members,
      :additional_product_information, :participation,
      :acts_ecological, :economical_behavior,
      :contact_function, :url)
json.ownerships do |ownerships|
  ownerships.array!(@farm.ownerships) do |ownership|
    json.(ownership, :user_id, :name, :contact_by_phone, :contact_by_email)
    json.(ownership, :email, :phone) if ownership.place.authorized? current_user
  end
end
json.image do
  json.(@farm.image, :description)
  json.url @farm.image.file.large.url
  json.thumbnail_url @farm.image.file.thumbnail.url
end
json.places do |places|
  places.array!(@farm.places) do |place|
    json.(place, :id, :name, :city, :address)
  end
end
