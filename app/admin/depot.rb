ActiveAdmin.register Depot do
  form do |f|
    PlaceForm.form(f)
    inputs "Associated Farms" do
      input :places, as: :select, collection: Farm.all
    end
    inputs "Additional Depot Info" do
      input :delivery_days
    end
    actions
  end

  index do
    column :id , sortable: :id do |depot|
      link_to depot.id, [:admin, depot]
    end
    column :name
    column :location
  end
end
