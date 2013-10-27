ActiveAdmin.register Depot do
  form do |f|
    PlaceForm.form(f)
    f.inputs "Associated Farms" do
      f.input :places, as: :select, collection: Farm.all
    end
    f.buttons
  end

  index do
    column :name
    column :location
    default_actions
  end
end
