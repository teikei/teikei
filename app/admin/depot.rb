ActiveAdmin.register Depot do
  form do |f|
    PlaceForm.form(f)
    f.buttons
  end

  index do
    column :name
    column :location
    default_actions
  end
end
