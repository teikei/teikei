ActiveAdmin.register Depot do
  form do |f|
    PlaceForm.form(f)
    f.inputs "Associated Farms" do
      f.input :places, as: :select, collection: Farm.all
    end
    f.inputs "Additional Depot Info" do
      f.input :delivery_days
    end
    f.buttons
  end

  index do
    column :name
    column :location
    actions
  end
end
