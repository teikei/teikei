ActiveAdmin.register Farm do

  index do
    column :name
    column :location
    default_actions
  end

  form do |f|
    f.inputs "Farm Details" do
      f.input :name
      f.input :location
    end
    f.buttons
  end

end
