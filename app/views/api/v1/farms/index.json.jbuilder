json.array! @farms do |place|
  json.(place,
        :id, :name, :city, :address, :latitude, :longitude,
        :accepts_new_members, :is_established, :description,
        :related_places_count,
        :vegetable_products, :animal_products, :beverages,
        :type, :updated_at)
  json.ownerships do |ownerships|
    ownerships.array!(place.ownerships) do |ownership|
      json.(ownership, :user_id, :name, :contact_by_phone, :contact_by_email)
      json.(ownership, :email, :phone) if ownership.place.authorized? current_user
    end
  end
end


