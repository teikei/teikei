ActiveAdmin.register Farm do
  form do |f|
    PlaceForm.form(f)
    f.inputs "Additional Farm Info" do
      f.input :founded_at_year
      f.input :founded_at_month
      f.input :maximum_members
      f.input :accepts_new_members
      f.input :products
      f.input :participation
      f.input :acts_ecological
      f.input :economical_behavior
      f.input :contact_function
      f.input :contact_url
    end
    f.buttons
  end

  index do
    column :name
    column :location
    default_actions
  end
end
